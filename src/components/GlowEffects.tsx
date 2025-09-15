"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useBuggyEffect } from "@/contexts/BuggyEffectContext" // Import useBuggyEffect

interface GlowOrbProps {
  size?: number
  color?: string
  intensity?: number
  duration?: number
  className?: string
}

export const GlowOrb = ({
  size = 100,
  color = "#10b981",
  intensity = 0.6,
  duration = 4,
  className = "",
}: GlowOrbProps) => {
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className} ${isBuggyMode ? 'animate-flicker' : ''}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}${Math.floor(intensity * 255)
          .toString(16)
          .padStart(2, "0")} 0%, transparent 70%)`,
        filter: `blur(${size * 0.1}px)`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [intensity, intensity * 1.5, intensity],
        rotate: [0, 360],
      }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    />
  )
}

interface PulsingGlowProps {
  children: React.ReactNode
  glowColor?: string
  intensity?: number
  className?: string
}

export const PulsingGlow = ({ children, glowColor = "#10b981", intensity = 0.3, className = "" }: PulsingGlowProps) => {
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  return (
    <motion.div
      className={`relative ${className} ${isBuggyMode ? 'animate-global-glitch' : ''}`}
      animate={{
        boxShadow: [
          `0 0 20px ${glowColor}${Math.floor(intensity * 255)
            .toString(16)
            .padStart(2, "0")}`,
          `0 0 40px ${glowColor}${Math.floor(intensity * 1.5 * 255)
            .toString(16)
            .padStart(2, "0")}, 0 0 60px ${glowColor}${Math.floor(intensity * 255)
            .toString(16)
            .padStart(2, "0")}`,
          `0 0 20px ${glowColor}${Math.floor(intensity * 255)
            .toString(16)
            .padStart(2, "0")}`,
        ],
      }}
      transition={{
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}

interface RippleGlowProps {
  trigger?: boolean
  color?: string
  className?: string
}

export const RippleGlow = ({ trigger = false, color = "#10b981", className = "" }: RippleGlowProps) => {
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  return (
    <motion.div
      className={`absolute inset-0 rounded-full pointer-events-none ${className} ${isBuggyMode ? 'animate-flicker' : ''}`}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={
        trigger
          ? {
              scale: [0, 2, 3],
              opacity: [0.8, 0.4, 0],
            }
          : {}
      }
      transition={{
        duration: 1.5,
        ease: "easeOut",
      }}
      style={{
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        filter: "blur(2px)",
      }}
    />
  )
}

interface TrailGlowProps {
  children: React.ReactNode
  color?: string
  trailLength?: number
  className?: string
}

export const TrailGlow = ({ children, color = "#10b981", trailLength = 20, className = "" }: TrailGlowProps) => {
  const trailRef = useRef<HTMLDivElement>(null)
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  useEffect(() => {
    const element = trailRef.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Create trail effect
      const trail = document.createElement("div")
      trail.style.position = "absolute"
      trail.style.left = `${x}px`
      trail.style.top = `${y}px`
      trail.style.width = "4px"
      trail.style.height = "4px"
      trail.style.borderRadius = "50%"
      trail.style.background = color
      trail.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`
      trail.style.pointerEvents = "none"
      trail.style.zIndex = "10"

      element.appendChild(trail)

      // Animate and remove trail
      trail.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(0)" },
        ],
        {
          duration: 1000,
          easing: "ease-out",
        },
      ).onfinish = () => {
        if (trail.parentNode) {
          trail.parentNode.removeChild(trail)
        }
      }
    }

    if (!isBuggyMode) {
      element.addEventListener("mousemove", handleMouseMove)
    } else {
      element.removeEventListener("mousemove", handleMouseMove)
    }
    
    return () => element.removeEventListener("mousemove", handleMouseMove)
  }, [color, isBuggyMode])

  return (
    <div ref={trailRef} className={`relative overflow-hidden ${className} ${isBuggyMode ? 'animate-global-glitch' : ''}`}>
      {children}
    </div>
  )
}

interface AuroraGlowProps {
  colors?: string[]
  className?: string
}

export const AuroraGlow = ({
  colors = ["#10b981", "#059669", "#047857", "#065f46"],
  className = "",
}: AuroraGlowProps) => {
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className} ${isBuggyMode ? 'animate-global-glitch' : ''}`}>
      {colors.map((color, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at ${20 + index * 20}% ${30 + index * 15}%, ${color}20 0%, transparent 50%)`,
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.3, 0.6, 0.2, 0.3],
          }}
          transition={{
            duration: 15 + index * 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: index * 2,
          }}
        />
      ))}
    </div>
  )
}

interface NeonTextProps {
  children: React.ReactNode
  color?: string
  intensity?: number
  className?: string
}

export const NeonText = ({ children, color = "#10b981", intensity = 1, className = "" }: NeonTextProps) => {
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  return (
    <motion.div
      className={`relative ${className} ${isBuggyMode ? 'animate-flicker' : ''}`}
      style={{
        color: color,
        textShadow: `
          0 0 5px ${color}${Math.floor(intensity * 0.8 * 255)
            .toString(16)
            .padStart(2, "0")},
          0 0 10px ${color}${Math.floor(intensity * 0.6 * 255)
            .toString(16)
            .padStart(2, "0")},
          0 0 15px ${color}${Math.floor(intensity * 0.4 * 255)
            .toString(16)
            .padStart(2, "0")},
          0 0 20px ${color}${Math.floor(intensity * 0.2 * 255)
            .toString(16)
            .padStart(2, "0")}
        `,
      }}
      animate={{
        textShadow: [
          `0 0 5px ${color}${Math.floor(intensity * 0.8 * 255)
            .toString(16)
            .padStart(2, "0")}, 0 0 10px ${color}${Math.floor(intensity * 0.6 * 255)
            .toString(16)
            .padStart(2, "0")}, 0 0 15px ${color}${Math.floor(intensity * 0.4 * 255)
            .toString(16)
            .padStart(2, "0")}`,
          `0 0 10px ${color}${Math.floor(intensity * 1.2 * 255)
            .toString(16)
            .padStart(2, "0")}, 0 0 20px ${color}${Math.floor(intensity * 0.8 * 255)
            .toString(16)
            .padStart(2, "0")}, 0 0 30px ${color}${Math.floor(intensity * 0.6 * 255)
            .toString(16)
            .padStart(2, "0")}`,
          `0 0 5px ${color}${Math.floor(intensity * 0.8 * 255)
            .toString(16)
            .padStart(2, "0")}, 0 0 10px ${color}${Math.floor(intensity * 0.6 * 255)
            .toString(16)
            .padStart(2, "0")}, 0 0 15px ${color}${Math.floor(intensity * 0.4 * 255)
            .toString(16)
            .padStart(2, "0")}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}

interface ElectricBorderProps {
  children: React.ReactNode
  color?: string
  thickness?: number
  speed?: number
  className?: string
}

export const ElectricBorder = ({
  children,
  color = "#10b981",
  thickness = 2,
  speed = 2,
  className = "",
}: ElectricBorderProps) => {
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  return (
    <motion.div
      className={`relative ${className} ${isBuggyMode ? 'animate-global-glitch' : ''}`}
      style={{
        border: `${thickness}px solid transparent`,
        borderRadius: "inherit",
        background: `linear-gradient(45deg, ${color}40, transparent, ${color}60, transparent, ${color}40) border-box`,
        backgroundClip: "border-box",
      }}
      animate={{
        background: [
          `linear-gradient(45deg, ${color}40, transparent, ${color}60, transparent, ${color}40) border-box`,
          `linear-gradient(135deg, ${color}60, transparent, ${color}40, transparent, ${color}60) border-box`,
          `linear-gradient(225deg, ${color}40, transparent, ${color}60, transparent, ${color}40) border-box`,
          `linear-gradient(315deg, ${color}60, transparent, ${color}40, transparent, ${color}60) border-box`,
        ],
      }}
      transition={{
        duration: speed,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}