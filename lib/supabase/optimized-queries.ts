import { createClient } from "@/lib/supabase/client"

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface FilterOptions {
  search?: string
  category?: string
  status?: string
  role?: string
  is_banned?: boolean
}

// Optimized user queries with pagination
export const getUsers = async (options: PaginationOptions & FilterOptions = {}) => {
  const supabase = createClient()
  const { page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc", search, role, is_banned } = options

  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range((page - 1) * limit, page * limit - 1)

  if (search) {
    query = query.or(`nickname.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (role) {
    query = query.eq("role", role)
  }

  if (typeof is_banned === "boolean") {
    query = query.eq("is_banned", is_banned)
  }

  return query
}

// Optimized advertisement queries with pagination and joins
export const getAdvertisements = async (options: PaginationOptions & FilterOptions = {}) => {
  const supabase = createClient()
  const { page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc", search, category, status } = options

  let query = supabase
    .from("advertisements")
    .select(
      `
      *,
      users!inner (
        nickname,
        role,
        avatar_url
      )
    `,
      { count: "exact" },
    )
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range((page - 1) * limit, page * limit - 1)

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (category) {
    query = query.eq("category", category)
  }

  if (status) {
    query = query.eq("status", status)
  }

  return query
}

// Optimized stats queries with single database call
export const getAdminStats = async () => {
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  // Use Promise.all for parallel execution
  const [
    { count: totalUsers },
    { count: totalAds },
    { count: activeAds },
    { count: vipUsers },
    { count: bannedUsers },
    { count: todayRegistrations },
    { count: todayAds },
    { count: totalMessages },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("advertisements").select("*", { count: "exact", head: true }),
    supabase.from("advertisements").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "vip"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("is_banned", true),
    supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("advertisements").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("messages").select("*", { count: "exact", head: true }),
  ])

  return {
    totalUsers: totalUsers || 0,
    totalAds: totalAds || 0,
    activeAds: activeAds || 0,
    vipUsers: vipUsers || 0,
    bannedUsers: bannedUsers || 0,
    todayRegistrations: todayRegistrations || 0,
    todayAds: todayAds || 0,
    totalMessages: totalMessages || 0,
  }
}

// Optimized conversation queries with better joins
export const getOptimizedConversations = async (userId: string) => {
  const supabase = createClient()

  // Single query with proper joins and aggregation
  const { data, error } = await supabase
    .from("messages")
    .select(`
      advertisement_id,
      sender_id,
      receiver_id,
      content,
      created_at,
      is_read,
      sender:users!messages_sender_id_fkey (nickname, role, avatar_url),
      receiver:users!messages_receiver_id_fkey (nickname, role, avatar_url),
      advertisement:advertisements (title, price, images)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error) return { data: [], error }

  // Process conversations on client side to avoid complex database queries
  const conversationsMap = new Map()

  data?.forEach((message) => {
    const isCurrentUserSender = message.sender_id === userId
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

    // Count unread messages
    if (!message.is_read && message.receiver_id === userId) {
      const conversation = conversationsMap.get(conversationKey)
      conversation.unread_count++
    }
  })

  return { data: Array.from(conversationsMap.values()), error: null }
}
