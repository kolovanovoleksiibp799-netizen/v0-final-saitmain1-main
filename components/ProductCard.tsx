"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Heart, Eye, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import VipBadge from "./VipBadge"
import type { Advertisement } from "@/lib/advertisements"

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
        }`}
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
              className="text-xs"
            >
              {condition === "new" ? "Новий" : condition === "used" ? "Вживаний" : "Відновлений"}
            </Badge>
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background rounded-full shadow-md glow-on-hover"
          style={{ right: condition ? "60px" : "16px" }}
        >
          <Heart className="w-4 h-4" />
        </Button>

        {/* Product Image */}
        <div className="relative overflow-hidden">
          <motion.img
            src={imageUrl}
            alt={title}
            className="w-full h-64 object-cover rounded-t-2xl"
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
            <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-2 flex-1">{title}</h3>
          </div>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${is_vip ? "text-yellow-600" : "text-primary"}`}>
                ₴{price?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center space-x-4">
              {location && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{location}</span>
                </div>
              )}
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                <span>{views_count || 0}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{new Date(created_at).toLocaleDateString("uk-UA")}</span>
            </div>
          </div>

          {/* Author Info */}
          {users && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">{users.nickname.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm text-muted-foreground">{users.nickname}</span>
                {users.role !== "user" && (
                  <Badge variant="outline" className="text-xs">
                    {users.role === "vip" ? "VIP" : users.role.toUpperCase()}
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
              }`}
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Зв'язатися
            </Button>
            <Link to={`/advertisement/${id}`} className="flex-1">
              <Button
                variant="outline"
                className="w-full px-6 rounded-2xl border-border hover:bg-background-secondary hover:scale-105 transition-transform glow-on-hover bg-transparent"
                size="lg"
              >
                Детальніше
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default ProductCard
