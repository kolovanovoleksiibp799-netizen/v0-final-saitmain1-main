"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Send, ArrowLeft, Trash2, Eye, EyeOff, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { getConversationMessages, sendMessage, markMessagesAsRead, deleteConversation } from "@/lib/messages"
import { getOptimizedConversations } from "@/lib/supabase/optimized-queries"
import { createClient } from "@/lib/supabase/client"
import type { Conversation, Message } from "@/lib/messages"
import VipBadge from "@/components/VipBadge"

export default function MessagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      fetchConversations()

      // Set up real-time subscription for new messages
      const messagesSubscription = supabase
        .channel("messages")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newMessage = payload.new as Message

              // Update messages if it's for the current conversation
              if (
                selectedConversation &&
                newMessage.advertisement_id === selectedConversation.advertisement_id &&
                (newMessage.sender_id === selectedConversation.other_user_id ||
                  newMessage.receiver_id === selectedConversation.other_user_id)
              ) {
                setMessages((prev) => [...prev, newMessage])

                // Auto-mark as read if it's the active conversation
                if (newMessage.receiver_id === user.id) {
                  markMessagesAsRead(newMessage.advertisement_id, newMessage.sender_id)
                }
              }

              // Update conversations list
              fetchConversations()
            }
          },
        )
        .subscribe()

      return () => {
        messagesSubscription.unsubscribe()
      }
    }
  }, [user, loading, router, selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversations = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await getOptimizedConversations(user.id)
      if (error) {
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити розмови",
          variant: "destructive",
        })
      } else {
        setConversations(data)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const fetchMessages = useCallback(async (conversation: Conversation) => {
    const { data, error } = await getConversationMessages(conversation.advertisement_id, conversation.other_user_id)
    if (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити повідомлення",
        variant: "destructive",
      })
    } else {
      setMessages(data)
      // Mark messages as read
      await markMessagesAsRead(conversation.advertisement_id, conversation.other_user_id)
      // Update conversation unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv.advertisement_id === conversation.advertisement_id && conv.other_user_id === conversation.other_user_id
            ? { ...conv, unread_count: 0 }
            : conv,
        ),
      )
    }
  }, [])

  const handleSelectConversation = useCallback(
    (conversation: Conversation) => {
      setSelectedConversation(conversation)
      fetchMessages(conversation)
    },
    [fetchMessages],
  )

  const handleSendMessage = useCallback(async () => {
    if (!selectedConversation || !newMessage.trim() || !user) return

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      advertisement_id: selectedConversation.advertisement_id,
      sender_id: user.id,
      receiver_id: selectedConversation.other_user_id,
      content: newMessage.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    }

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage])
    setNewMessage("")
    setIsSending(true)

    try {
      const { data, error } = await sendMessage(
        selectedConversation.advertisement_id,
        selectedConversation.other_user_id,
        newMessage.trim(),
      )

      if (error) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
        setNewMessage(newMessage) // Restore message
        toast({
          title: "Помилка",
          description: "Не вдалося надіслати повідомлення",
          variant: "destructive",
        })
      } else if (data) {
        // Replace temp message with real one
        setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? data : msg)))

        // Update conversation with new message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.advertisement_id === selectedConversation.advertisement_id &&
            conv.other_user_id === selectedConversation.other_user_id
              ? {
                  ...conv,
                  last_message: data.content,
                  last_message_time: data.created_at,
                }
              : conv,
          ),
        )
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
      setNewMessage(newMessage)
    } finally {
      setIsSending(false)
    }
  }, [selectedConversation, newMessage, user])

  const handleDeleteConversation = async (conversation: Conversation) => {
    const { error } = await deleteConversation(conversation.advertisement_id, conversation.other_user_id)
    if (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося видалити розмову",
        variant: "destructive",
      })
    } else {
      setConversations((prev) =>
        prev.filter(
          (conv) =>
            !(
              conv.advertisement_id === conversation.advertisement_id &&
              conv.other_user_id === conversation.other_user_id
            ),
        ),
      )
      if (selectedConversation?.advertisement_id === conversation.advertisement_id) {
        setSelectedConversation(null)
        setMessages([])
      }
      toast({
        title: "Успішно",
        description: "Розмову видалено",
        variant: "default",
      })
    }
  }

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (conv) =>
          conv.other_user_nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.advertisement_title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [conversations, searchQuery],
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Повідомлення</h1>
              <p className="text-muted-foreground">Ваші розмови про оголошення</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="glass-card h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Розмови ({conversations.length})</span>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Пошук розмов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Немає розмов</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredConversations.map((conversation, index) => (
                        <motion.div
                          key={`${conversation.advertisement_id}-${conversation.other_user_id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`p-4 cursor-pointer transition-colors hover:bg-background-secondary/50 ${
                            selectedConversation?.advertisement_id === conversation.advertisement_id &&
                            selectedConversation?.other_user_id === conversation.other_user_id
                              ? "bg-accent/10 border-r-2 border-accent"
                              : ""
                          }`}
                          onClick={() => handleSelectConversation(conversation)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {conversation.advertisement_image ? (
                                <img
                                  src={conversation.advertisement_image || "/placeholder.svg"}
                                  alt={conversation.advertisement_title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                                  <MessageSquare className="w-6 h-6 text-accent" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm truncate">
                                    {conversation.other_user_nickname}
                                  </span>
                                  {conversation.other_user_role === "vip" && <VipBadge size="sm" />}
                                  {conversation.other_user_role === "admin" && (
                                    <Badge variant="destructive" className="text-xs">
                                      ADMIN
                                    </Badge>
                                  )}
                                </div>
                                {conversation.unread_count > 0 && (
                                  <Badge className="bg-red-500 text-white text-xs min-w-[20px] h-5">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mb-1">
                                {conversation.advertisement_title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{conversation.last_message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  ₴{conversation.advertisement_price.toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(conversation.last_message_time).toLocaleDateString("uk-UA")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Messages Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                          <span className="font-medium">
                            {selectedConversation.other_user_nickname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{selectedConversation.other_user_nickname}</h3>
                            {selectedConversation.other_user_role === "vip" && <VipBadge size="sm" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{selectedConversation.advertisement_title}</p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Видалити розмову</DialogTitle>
                            <DialogDescription>
                              Ви впевнені, що хочете видалити цю розмову? Цю дію неможливо скасувати.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Скасувати</Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteConversation(selectedConversation)}
                            >
                              Видалити
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full p-4">
                      <AnimatePresence>
                        {messages.map((message, index) => {
                          const isCurrentUser = message.sender_id === user.id
                          const isTemp = message.id.startsWith("temp-")
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: isTemp ? 0.7 : 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] p-3 rounded-2xl ${
                                  isCurrentUser
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-background-secondary text-foreground"
                                } ${isTemp ? "opacity-70" : ""}`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs opacity-70">
                                    {new Date(message.created_at).toLocaleTimeString("uk-UA", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {isCurrentUser && !isTemp && (
                                    <div className="ml-2">
                                      {message.is_read ? (
                                        <Eye className="w-3 h-3 opacity-70" />
                                      ) : (
                                        <EyeOff className="w-3 h-3 opacity-70" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </ScrollArea>
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t border-border/50 p-4">
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Напишіть повідомлення..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none bg-background/50 border-border/50"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="self-end"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Оберіть розмову</h3>
                    <p className="text-muted-foreground">Виберіть розмову зі списку, щоб почати спілкування</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
