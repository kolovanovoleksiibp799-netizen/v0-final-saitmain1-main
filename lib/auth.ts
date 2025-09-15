import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"

export interface User {
  id: string
  nickname: string
  email?: string
  role: "user" | "vip" | "moderator" | "admin"
  is_banned: boolean
  avatar_url?: string
  phone?: string
  location?: string
  bio?: string
  vip_expires_at?: string
  created_at: string
}

// Simple hash function for passwords (for backward compatibility)
const simpleHash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

// Register user with Supabase Auth
export const registerUser = async (nickname: string, email: string, password: string) => {
  try {
    const supabase = createClient()

    // Check if nickname already exists in our users table
    const { data: existingUser } = await supabase.from("users").select("id").eq("nickname", nickname).single()

    if (existingUser) {
      throw new Error("Користувач з таким нікнеймом вже існує")
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        data: {
          nickname,
        },
      },
    })

    if (authError) throw authError

    // Create user profile in our users table
    if (authData.user) {
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          nickname,
          email,
          password_hash: simpleHash(password), // Keep for backward compatibility
          role: "user",
        },
      ])

      if (profileError) throw profileError
    }

    return { user: authData.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Login user with Supabase Auth
export const loginUser = async (identifier: string, password: string) => {
  try {
    const supabase = createClient()

    // Check if identifier is email or nickname
    const isEmail = identifier.includes("@")
    let email = identifier

    if (!isEmail) {
      // Get email by nickname
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, is_banned")
        .eq("nickname", identifier)
        .single()

      if (userError || !userData) {
        throw new Error("Користувача не знайдено")
      }

      if (userData.is_banned) {
        throw new Error("Ваш акаунт заблоковано")
      }

      if (!userData.email) {
        throw new Error("Email не знайдено для цього користувача")
      }

      email = userData.email
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Update last login
    if (data.user) {
      await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", data.user.id)
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Logout user
export const logoutUser = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user from Supabase Auth
export const getCurrentUser = async () => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile from our users table
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return profile
}

// Get current user server-side
export const getCurrentUserServer = async () => {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile from our users table
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return profile
}

// Check if user has permission
export const hasPermission = (user: User | null, requiredRoles: string[]): boolean => {
  if (!user || user.is_banned) return false
  return requiredRoles.includes(user.role)
}

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const supabase = createClient()

  const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

  return { data, error }
}

// Admin functions
export const updateUserRole = async (userId: string, role: User["role"]) => {
  const supabase = createClient()

  const { data, error } = await supabase.from("users").update({ role }).eq("id", userId).select().single()

  return { data, error }
}

export const banUser = async (userId: string, banned: boolean) => {
  const supabase = createClient()

  const { data, error } = await supabase.from("users").update({ is_banned: banned }).eq("id", userId).select().single()

  return { data, error }
}

export const giveVipStatus = async (userId: string, days = 30) => {
  const supabase = createClient()

  const vipExpiresAt = new Date()
  vipExpiresAt.setDate(vipExpiresAt.getDate() + days)

  const { data, error } = await supabase
    .from("users")
    .update({
      role: "vip",
      vip_expires_at: vipExpiresAt.toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  return { data, error }
}
