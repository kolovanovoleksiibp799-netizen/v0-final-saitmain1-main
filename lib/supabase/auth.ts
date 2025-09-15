import { createClient } from "./client"
import { createClient as createServerClient } from "./server"

export interface User {
  id: string
  nickname: string
  email: string
  role: "user" | "vip" | "moderator" | "admin"
  avatar_url?: string
}

export async function signUp(email: string, password: string, nickname: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
      data: {
        nickname,
      },
    },
  })

  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: userData, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (error || !userData) return null

  return userData as User
}

export async function getServerUser(): Promise<User | null> {
  const supabase = await createServerClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: userData, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (error || !userData) return null

  return userData as User
}
