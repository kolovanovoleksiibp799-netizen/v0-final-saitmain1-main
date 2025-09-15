"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RippleGlow, TrailGlow } from "./GlowEffects"

interface EnhancedGlowButtonProps {
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  glowColor?: string
  glowIntensity?: number
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export const EnhancedGlowButton = ({
  children,
  variant = "default",
  size = "default",
  glowColor = "#10b981",
  glowIntensity = 0.6,
  onClick,
  className = "",
  disabled = false,
}: EnhancedGlowButtonProps) => {
  const [isClicked, setIsClicked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (disabled) return
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 1500)
    onClick?.()
  }

  return (
    <TrailGlow color={glowColor} className="inline-block">
      <motion.div
        className="relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isHovered
            ? [
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
              ]
            : `0 0 10px ${glowColor}${Math.floor(glowIntensity * 0.5 * 255)
                .toString(16)
                .padStart(2, "0")}`,
        }}
        transition={{
          duration: isHovered ? 2 : 0.3,
          repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
          ease: "easeInOut",
        }}
      >
        <Button
          variant={variant}
          size={size}
          onClick={handleClick}
          disabled={disabled}
          className={`relative overflow-hidden transition-all duration-300 ${className}`}
          style={{
            background: isHovered ? `linear-gradient(45deg, ${glowColor}20, transparent, ${glowColor}30)` : undefined,
          }}
        >
          {/* Animated background shimmer */}
          <motion.div
            className="absolute inset-0 -z-10"
            animate={
              isHovered
                ? {
                    background: [
                      `linear-gradient(45deg, transparent, ${glowColor}10, transparent)`,
                      `linear-gradient(45deg, transparent, transparent, ${glowColor}10, transparent, transparent)`,
                      `linear-gradient(45deg, transparent, ${glowColor}10, transparent)`,
                    ],
                    x: ["-100%", "100%", "-100%"],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          {/* Content with enhanced glow */}
          <motion.span
            className="relative z-10"
            animate={
              isHovered
                ? {
                    textShadow: [
                      `0 0 5px ${glowColor}80`,
                      `0 0 10px ${glowColor}60, 0 0 20px ${glowColor}40`,
                      `0 0 5px ${glowColor}80`,
                    ],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {children}
          </motion.span>

          {/* Ripple effect on click */}
          <RippleGlow trigger={isClicked} color={glowColor} />

          {/* Border glow */}
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            animate={
              isHovered
                ? {
                    boxShadow: [
                      `inset 0 0 10px ${glowColor}30`,
                      `inset 0 0 20px ${glowColor}50, inset 0 0 30px ${glowColor}30`,
                      `inset 0 0 10px ${glowColor}30`,
                    ],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </Button>
      </motion.div>
    </TrailGlow>
  )
}