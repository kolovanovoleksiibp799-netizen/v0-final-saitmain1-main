import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"

export interface Advertisement {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  category: string
  subcategory: string
  images: string[]
  status: string
  is_vip: boolean
  vip_expires_at?: string
  views_count: number
  contact_phone?: string
  contact_email?: string
  location?: string
  condition?: string
  tags: string[]
  featured: boolean
  created_at: string
  updated_at: string
  users?: {
    nickname: string
    role: string
    avatar_url?: string
  }
}

// Get advertisements with VIP priority
export const getAdvertisements = async (
  options: {
    category?: string
    subcategory?: string
    search?: string
    limit?: number
    offset?: number
    status?: string
  } = {},
) => {
  const supabase = createClient()
  const { category, subcategory, search, limit = 20, offset = 0, status = "active" } = options

  let query = supabase
    .from("advertisements")
    .select(
      `
      *,
      users (nickname, role, avatar_url)
    `,
    )
    .eq("status", status)

  // Apply filters
  if (category) {
    query = query.eq("category", category)
  }

  if (subcategory) {
    query = query.eq("subcategory", subcategory)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // VIP priority ordering: VIP ads first, then by creation date
  query = query
    .order("is_vip", { ascending: false })
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching advertisements:", error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

// Get advertisements server-side with VIP priority
export const getAdvertisementsServer = async (
  options: {
    category?: string
    subcategory?: string
    search?: string
    limit?: number
    offset?: number
    status?: string
  } = {},
) => {
  const supabase = await createServerClient()
  const { category, subcategory, search, limit = 20, offset = 0, status = "active" } = options

  let query = supabase
    .from("advertisements")
    .select(
      `
      *,
      users (nickname, role, avatar_url)
    `,
    )
    .eq("status", status)

  // Apply filters
  if (category) {
    query = query.eq("category", category)
  }

  if (subcategory) {
    query = query.eq("subcategory", subcategory)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // VIP priority ordering: VIP ads first, then by creation date
  query = query
    .order("is_vip", { ascending: false })
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching advertisements:", error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

// Create advertisement
export const createAdvertisement = async (adData: Partial<Advertisement>) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("advertisements")
    .insert([adData])
    .select(
      `
      *,
      users (nickname, role, avatar_url)
    `,
    )
    .single()

  return { data, error }
}

// Update advertisement
export const updateAdvertisement = async (id: string, updates: Partial<Advertisement>) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("advertisements")
    .update(updates)
    .eq("id", id)
    .select(
      `
      *,
      users (nickname, role, avatar_url)
    `,
    )
    .single()

  return { data, error }
}

// Delete advertisement
export const deleteAdvertisement = async (id: string) => {
  const supabase = createClient()

  const { error } = await supabase.from("advertisements").delete().eq("id", id)

  return { error }
}

// Increment views count
export const incrementViews = async (id: string) => {
  const supabase = createClient()

  const { error } = await supabase.rpc("increment_views", { ad_id: id })

  return { error }
}

// Get advertisement by ID
export const getAdvertisementById = async (id: string) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("advertisements")
    .select(
      `
      *,
      users (nickname, role, avatar_url)
    `,
    )
    .eq("id", id)
    .single()

  return { data, error }
}

// Get user's advertisements
export const getUserAdvertisements = async (userId: string) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("advertisements")
    .select(
      `
      *,
      users (nickname, role, avatar_url)
    `,
    )
    .eq("user_id", userId)
    .order("is_vip", { ascending: false })
    .order("created_at", { ascending: false })

  return { data: data || [], error }
}

// Search advertisements with VIP priority
export const searchAdvertisements = async (query: string, filters: any = {}) => {
  const supabase = createClient()

  let searchQuery = supabase
    .from("advertisements")
    .select(
      `
      *,
      users (nickname, role, avatar_url)
    `,
    )
    .eq("status", "active")

  if (query) {
    searchQuery = searchQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
  }

  // Apply additional filters
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      searchQuery = searchQuery.eq(key, filters[key])
    }
  })

  // VIP priority ordering
  searchQuery = searchQuery
    .order("is_vip", { ascending: false })
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50)

  const { data, error } = await searchQuery

  return { data: data || [], error }
}
