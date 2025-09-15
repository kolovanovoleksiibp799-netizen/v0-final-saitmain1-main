"use client"

import { Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useBuggyEffect } from "@/contexts/BuggyEffectContext" // Import useBuggyEffect
import GlitchText from "./GlitchText" // Import GlitchText

interface VipBadgeProps {
  className?: string
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export default function VipBadge({ className = "", size = "md", animated = true }: VipBadgeProps) {
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const BadgeComponent = (
    <Badge
      className={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold border-0 ${sizeClasses[size]} ${className} ${isBuggyMode ? 'animate-flicker' : ''}`}
    >
      <Crown className={`${iconSizes[size]} mr-1`} />
      <GlitchText intensity={isBuggyMode ? 0.7 : 0}>VIP</GlitchText>
    </Badge>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {BadgeComponent}
      </motion.div>
    )
  }

  return BadgeComponent
}