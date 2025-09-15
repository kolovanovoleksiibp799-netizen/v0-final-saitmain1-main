import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Використовуємо змінні середовища з префіксом VITE_ для Vite
  return createBrowserClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!)
}