"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { AuroraGlow, ElectricBorder } from "./GlowEffects"

interface GlowCardProps {
  children: React.ReactNode
  glowColor?: string
  glowIntensity?: number
  hasAurora?: boolean
  hasElectricBorder?: boolean
  className?: string
}

export const GlowCard = ({
  children,
  glowColor = "#10b981",
  glowIntensity = 0.4,
  hasAurora = false,
  hasElectricBorder = false,
  className = "",
}: GlowCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const cardContent = (
    <motion.div
      className="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card
        className={`relative overflow-hidden transition-all duration-500 ${className}`}
        style={{
          background: isHovered ? `linear-gradient(135deg, ${glowColor}05, transparent, ${glowColor}10)` : undefined,
        }}
      >
        {/* Aurora background effect */}
        {hasAurora && <AuroraGlow colors={[glowColor, `${glowColor}80`, `${glowColor}60`]} />}

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          animate={
            isHovered
              ? {
                  boxShadow: [
                    `0 0 20px ${glowColor}${Math.floor(glowIntensity * 255)
                      .toString(16)
                      .padStart(2, "0")}`,
                    `0 0 40px ${glowColor}${Math.floor(glowIntensity * 1.5 * 255)
                      .toString(16)
                      .padStart(2, "0")}, 0 0 60px ${glowColor}${Math.floor(glowIntensity * 255)
                      .toString(16)
                      .padStart(2, "0")}`,
                    `0 0 20px ${glowColor}${Math.floor(glowIntensity * 255)
                      .toString(16)
                      .padStart(2, "0")}`,
                  ],
                }
              : {}
          }
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={
            isHovered
              ? {
                  background: [
                    `linear-gradient(45deg, transparent, ${glowColor}10, transparent)`,
                    `linear-gradient(135deg, transparent, ${glowColor}15, transparent)`,
                    `linear-gradient(225deg, transparent, ${glowColor}10, transparent)`,
                    `linear-gradient(315deg, transparent, ${glowColor}15, transparent)`,
                  ],
                }
              : {}
          }
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </Card>
    </motion.div>
  )

  if (hasElectricBorder) {
    return (
      <ElectricBorder color={glowColor} thickness={2} speed={3}>
        {cardContent}
      </ElectricBorder>
    )
  }

  return cardContent
}
