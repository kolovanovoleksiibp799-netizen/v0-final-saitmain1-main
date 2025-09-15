"use client"

import { useState } from "react"
import { MessageSquare, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { sendMessage, canMessageAboutAd } from "@/lib/messages"
import { useRouter } from "next/navigation"

interface ContactButtonProps {
  advertisementId: string
  ownerId: string
  ownerNickname: string
  contactPhone?: string
  contactEmail?: string
  className?: string
}

export default function ContactButton({
  advertisementId,
  ownerId,
  ownerNickname,
  contactPhone,
  contactEmail,
  className = "",
}: ContactButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (!message.trim()) {
      toast({
        title: "Помилка",
        description: "Введіть повідомлення",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    // Check if user can message about this ad
    const { canMessage, error: canMessageError } = await canMessageAboutAd(advertisementId)

    if (canMessageError || !canMessage) {
      toast({
        title: "Помилка",
        description: canMessageError || "Неможливо надіслати повідомлення",
        variant: "destructive",
      })
      setIsSending(false)
      return
    }

    const { data, error } = await sendMessage(advertisementId, ownerId, message)

    if (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося надіслати повідомлення",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успішно",
        description: "Повідомлення надіслано",
        variant: "default",
      })
      setIsDialogOpen(false)
      setMessage("")
      // Redirect to messages page
      router.push("/messages")
    }

    setIsSending(false)
  }

  if (!user) {
    return (
      <Button onClick={() => router.push("/auth/login")} className={`btn-accent ${className}`}>
        <MessageSquare className="w-4 h-4 mr-2" />
        Зв'язатися
      </Button>
    )
  }

  // Don't show contact button for own ads
  if (user.id === ownerId) {
    return null
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className={`btn-accent ${className}`}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Зв'язатися
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Зв'язатися з {ownerNickname}</DialogTitle>
          <DialogDescription>Надішліть повідомлення або скористайтеся контактними даними</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact Info */}
          {(contactPhone || contactEmail) && (
            <div className="space-y-2">
              <h4 className="font-medium">Контактна інформація:</h4>
              {contactPhone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${contactPhone}`} className="text-accent hover:underline">
                    {contactPhone}
                  </a>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${contactEmail}`} className="text-accent hover:underline">
                    {contactEmail}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Message Form */}
          <div className="space-y-2">
            <h4 className="font-medium">Або надішліть повідомлення:</h4>
            <Textarea
              placeholder="Напишіть ваше повідомлення..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="bg-background/50 border-border/50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSendMessage} disabled={!message.trim() || isSending}>
            {isSending ? "Надсилання..." : "Надіслати"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
