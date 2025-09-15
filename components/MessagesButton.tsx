"use client"

import { useEffect, useState } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { getUnreadMessagesCount } from "@/lib/messages"
import { useRouter } from "next/navigation"

export default function MessagesButton() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      // Set up polling for unread count
      const interval = setInterval(fetchUnreadCount, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    const { count } = await getUnreadMessagesCount()
    setUnreadCount(count)
  }

  if (!user) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push("/messages")}
      className="relative rounded-2xl interactive-liquid glow-emerald float-gentle"
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      Повідомлення
      {unreadCount > 0 && (
        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  )
}
