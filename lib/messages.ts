import { createClient } from "@/lib/supabase/client"

export interface Message {
  id: string
  advertisement_id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: {
    nickname: string
    role: string
    avatar_url?: string
  }
  receiver?: {
    nickname: string
    role: string
    avatar_url?: string
  }
  advertisement?: {
    title: string
    price: number
    images: string[]
  }
}

export interface Conversation {
  advertisement_id: string
  other_user_id: string
  other_user_nickname: string
  other_user_role: string
  other_user_avatar?: string
  advertisement_title: string
  advertisement_price: number
  advertisement_image?: string
  last_message: string
  last_message_time: string
  unread_count: number
  is_sender: boolean
}

// Send a message
export const sendMessage = async (
  advertisementId: string,
  receiverId: string,
  content: string,
): Promise<{ data: Message | null; error: any }> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        advertisement_id: advertisementId,
        receiver_id: receiverId,
        content: content.trim(),
      },
    ])
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey (nickname, role, avatar_url),
      receiver:users!messages_receiver_id_fkey (nickname, role, avatar_url),
      advertisement:advertisements (title, price, images)
    `,
    )
    .single()

  return { data, error }
}

// Get messages for a specific advertisement conversation
export const getConversationMessages = async (
  advertisementId: string,
  otherUserId: string,
): Promise<{ data: Message[]; error: any }> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey (nickname, role, avatar_url),
      receiver:users!messages_receiver_id_fkey (nickname, role, avatar_url),
      advertisement:advertisements (title, price, images)
    `,
    )
    .eq("advertisement_id", advertisementId)
    .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
    .order("created_at", { ascending: true })

  return { data: data || [], error }
}

// Get all conversations for current user
export const getUserConversations = async (): Promise<{ data: Conversation[]; error: any }> => {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: [], error: "Not authenticated" }

  // Get all messages where user is sender or receiver
  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey (nickname, role, avatar_url),
      receiver:users!messages_receiver_id_fkey (nickname, role, avatar_url),
      advertisement:advertisements (title, price, images)
    `,
    )
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (error) return { data: [], error }

  // Group messages by advertisement and other user
  const conversationsMap = new Map<string, Conversation>()

  messages?.forEach((message) => {
    const isCurrentUserSender = message.sender_id === user.id
    const otherUser = isCurrentUserSender ? message.receiver : message.sender
    const conversationKey = `${message.advertisement_id}-${otherUser?.nickname}`

    if (!conversationsMap.has(conversationKey)) {
      conversationsMap.set(conversationKey, {
        advertisement_id: message.advertisement_id,
        other_user_id: isCurrentUserSender ? message.receiver_id : message.sender_id,
        other_user_nickname: otherUser?.nickname || "Unknown",
        other_user_role: otherUser?.role || "user",
        other_user_avatar: otherUser?.avatar_url,
        advertisement_title: message.advertisement?.title || "Unknown",
        advertisement_price: message.advertisement?.price || 0,
        advertisement_image: message.advertisement?.images?.[0],
        last_message: message.content,
        last_message_time: message.created_at,
        unread_count: 0,
        is_sender: isCurrentUserSender,
      })
    }

    // Update unread count
    if (!message.is_read && message.receiver_id === user.id) {
      const conversation = conversationsMap.get(conversationKey)!
      conversation.unread_count++
    }
  })

  return { data: Array.from(conversationsMap.values()), error: null }
}

// Mark messages as read
export const markMessagesAsRead = async (advertisementId: string, senderId: string): Promise<{ error: any }> => {
  const supabase = createClient()

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("advertisement_id", advertisementId)
    .eq("sender_id", senderId)
    .eq("is_read", false)

  return { error }
}

// Get unread messages count
export const getUnreadMessagesCount = async (): Promise<{ count: number; error: any }> => {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { count: 0, error: "Not authenticated" }

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false)

  return { count: count || 0, error }
}

// Delete conversation
export const deleteConversation = async (advertisementId: string, otherUserId: string): Promise<{ error: any }> => {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("advertisement_id", advertisementId)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)

  return { error }
}

// Check if user can message about advertisement
export const canMessageAboutAd = async (advertisementId: string): Promise<{ canMessage: boolean; error: any }> => {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { canMessage: false, error: "Not authenticated" }

  // Get advertisement details
  const { data: ad, error } = await supabase
    .from("advertisements")
    .select("user_id, status")
    .eq("id", advertisementId)
    .single()

  if (error) return { canMessage: false, error }

  // Can't message own advertisement or inactive ads
  const canMessage = ad.user_id !== user.id && ad.status === "active"

  return { canMessage, error: null }
}
