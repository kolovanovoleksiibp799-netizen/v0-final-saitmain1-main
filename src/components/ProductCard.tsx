"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Heart, Eye, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import VipBadge from "./VipBadge"
import type { Advertisement } from "@/lib/advertisements"
import { useBuggyEffect } from "@/contexts/BuggyEffectContext" // Import useBuggyEffect
import GlitchText from "./GlitchText" // Import GlitchText

interface ProductCardProps extends Advertisement {
  index: number
}

const ProductCard = ({
  id,
  title,
  description,
  price,
  images,
  is_vip,
  views_count,
  location,
  created_at,
  users,
  condition,
  index,
}: ProductCardProps) => {
  const imageUrl = images?.[0] || "/placeholder.svg?height=300&width=400&text=Без+фото"
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{ y: -8, boxShadow: "0 20px 60px -15px hsl(var(--shadow-soft) / 0.4)" }}
      className="group relative"
    >
      <Card
        className={`glass-card overflow-hidden relative ${
          is_vip ? "ring-2 ring-yellow-500/50 shadow-yellow-500/20" : ""
        } ${isBuggyMode ? 'animate-card-wobble' : ''}`}
      >
        {/* VIP Badge */}
        {is_vip && (
          <div className="absolute top-4 left-4 z-10">
            <VipBadge size="sm" />
          </div>
        )}

        {/* Condition Badge */}
        {condition && (
          <div className="absolute top-4 right-4 z-10">
            <Badge
              variant={condition === "new" ? "default" : condition === "used" ? "secondary" : "outline"}
              className={`text-xs ${isBuggyMode ? 'animate-flicker' : ''}`}
            >
              <GlitchText intensity={isBuggyMode ? 0.7 : 0}>
                {condition === "new" ? "Новий" : condition === "used" ? "Вживаний" : "Відновлений"}
              </GlitchText>
            </Badge>
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background rounded-full shadow-md glow-on-hover ${isBuggyMode ? 'animate-spin-slow' : ''}`}
          style={{ right: condition ? "60px" : "16px" }}
        >
          <Heart className="w-4 h-4" />
        </Button>

        {/* Product Image */}
        <div className="relative overflow-hidden">
          <motion.img
            src={imageUrl}
            alt={title}
            className={`w-full h-64 object-cover rounded-t-2xl ${isBuggyMode ? 'animate-image-distort' : ''}`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          {is_vip && (
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-2 flex-1"><GlitchText intensity={isBuggyMode ? 0.8 : 0}>{title}</GlitchText></h3>
          </div>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>{description}</GlitchText></p>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${is_vip ? "text-yellow-600" : "text-primary"} ${isBuggyMode ? 'animate-flicker' : ''}`}>
                <GlitchText intensity={isBuggyMode ? 0.9 : 0}>₴{price?.toLocaleString()}</GlitchText>
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center space-x-4">
              {location && (
                <div className="flex items-center">
                  <MapPin className={`w-3 h-3 mr-1 ${isBuggyMode ? 'animate-spin-fast' : ''}`} />
                  <span><GlitchText intensity={isBuggyMode ? 0.5 : 0}>{location}</GlitchText></span>
                </div>
              )}
              <div className="flex items-center">
                <Eye className={`w-3 h-3 mr-1 ${isBuggyMode ? 'animate-spin-reverse' : ''}`} />
                <span><GlitchText intensity={isBuggyMode ? 0.5 : 0}>{views_count || 0}</GlitchText></span>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className={`w-3 h-3 mr-1 ${isBuggyMode ? 'animate-spin-slow' : ''}`} />
              <span><GlitchText intensity={isBuggyMode ? 0.5 : 0}>{new Date(created_at).toLocaleDateString("uk-UA")}</GlitchText></span>
            </div>
          </div>

          {/* Author Info */}
          {users && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center ${isBuggyMode ? 'animate-card-wobble' : ''}`}>
                  <span className="text-xs font-medium"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>{users.nickname.charAt(0).toUpperCase()}</GlitchText></span>
                </div>
                <span className="text-sm text-muted-foreground"><GlitchText intensity={isBuggyMode ? 0.6 : 0}>{users.nickname}</GlitchText></span>
                {users.role !== "user" && (
                  <Badge variant="outline" className={`text-xs ${isBuggyMode ? 'animate-flicker' : ''}`}>
                    <GlitchText intensity={isBuggyMode ? 0.7 : 0}>
                      {users.role === "vip" ? "VIP" : users.role.toUpperCase()}
                    </GlitchText>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              className={`flex-1 rounded-2xl hover:shadow-glow glow-on-hover ${
                is_vip ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "btn-accent"
              } ${isBuggyMode ? 'animate-button-flicker' : ''}`}
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <GlitchText intensity={isBuggyMode ? 0.8 : 0}>Зв'язатися</GlitchText>
            </Button>
            <Link to={`/advertisement/${id}`} className="flex-1">
              <Button
                variant="outline"
                className={`w-full px-6 rounded-2xl border-border hover:bg-background-secondary hover:scale-105 transition-transform glow-on-hover bg-transparent ${isBuggyMode ? 'animate-card-wobble' : ''}`}
                size="lg"
              >
                <GlitchText intensity={isBuggyMode ? 0.6 : 0}>Детальніше</GlitchText>
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default ProductCard