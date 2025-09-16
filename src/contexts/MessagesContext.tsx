import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner'; // Corrected import to sonner

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  advertisement_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  conversation_id: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  advertisement_id: string | null;
  last_message_id: string | null;
  user1_unread_count: number;
  user2_unread_count: number;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  other_user?: {
    id: string;
    nickname: string;
    role: string;
  } | null;
}

interface MessagesContextType {
  conversations: Conversation[];
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string, advertisementId?: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

    const fetchConversations = useCallback(async () => {
      if (!user) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            last_message:messages!conversations_last_message_id_fkey(*),
            advertisement:advertisements(*)
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const conversationsWithUsers = await Promise.all(
          (data || []).map(async (conv) => {
            const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

            const { data: otherUser } = await supabase
              .from('users')
              .select('id, nickname, role')
              .eq('id', otherUserId)
              .single();

            return {
              ...conv,
              other_user: otherUser || null
            };
          })
        );

        setConversations(conversationsWithUsers);

        const totalUnread = conversationsWithUsers.reduce((sum, conv) => {
          if (conv.user1_id === user.id) {
            return sum + conv.user1_unread_count;
          }
          return sum + conv.user2_unread_count;
        }, 0);

        setUnreadCount(totalUnread);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'невідома помилка';
        toast.error('Помилка завантаження розмов: ' + errorMessage);
      } finally {
        setLoading(false);
      }
    }, [user]);

    const fetchMessages = useCallback(async (conversationId: string) => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMessages(data || []);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'невідома помилка';
        toast.error('Помилка завантаження повідомлень: ' + errorMessage);
      }
    }, []);

    const sendMessage = useCallback(
      async (receiverId: string, content: string, advertisementId?: string) => {
        if (!user) {
          toast.error('Ви не авторизовані');
          return;
        }

        try {
          const { data, error } = await supabase.rpc('send_message', {
            p_receiver_id: receiverId,
            p_content: content,
            p_advertisement_id: advertisementId,
          });

          if (error) throw error;
          const newMessageData = data as Message | null;
          if (!newMessageData) {
            throw new Error('Не вдалося отримати відповідь від сервера');
          }

          if (activeConversation === newMessageData.conversation_id) {
            setMessages((prevMessages) => [...prevMessages, newMessageData]);
          }

          await fetchConversations();
          toast.success('Повідомлення надіслано');
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'невідома помилка';
          toast.error('Помилка надсилання повідомлення: ' + errorMessage);
        }
      },
      [user, activeConversation, fetchConversations],
    );

    const markAsRead = useCallback(
      async (conversationId: string) => {
        try {
          const { error } = await supabase.rpc('mark_conversation_as_read', {
            p_conversation_id: conversationId,
          });

          if (error) throw error;

          await fetchConversations();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'невідома помилка';
          toast.error('Помилка позначення повідомлень як прочитаних: ' + errorMessage);
        }
      },
      [fetchConversations],
    );

    const subscribeToNewMessages = useCallback(() => {
      if (!user?.id) return () => {};

      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;

            toast.info('Нове повідомлення', {
              description: newMessage.content,
              action: {
                label: 'Переглянути',
                onClick: () => {
                  setActiveConversation(newMessage.conversation_id);
                },
              },
            });

            if (activeConversation === newMessage.conversation_id) {
              setMessages((prevMessages) => [...prevMessages, newMessage]);
              void markAsRead(newMessage.conversation_id);
            }

            void fetchConversations();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [user?.id, activeConversation, markAsRead, fetchConversations]);

    useEffect(() => {
      if (!user) {
        setConversations([]);
        setMessages([]);
        setUnreadCount(0);
        return;
      }

      fetchConversations();
      const unsubscribe = subscribeToNewMessages();
      return () => unsubscribe();
    }, [user, fetchConversations, subscribeToNewMessages]);

    return (
    <MessagesContext.Provider
      value={{
        conversations,
        messages,
        unreadCount,
        loading,
        activeConversation,
        setActiveConversation,
        fetchConversations,
        fetchMessages,
        sendMessage,
        markAsRead
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};