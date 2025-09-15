"use client"

import { useState, useEffect } from "react"
import LiquidGrassBackground from "./LiquidGrassBackground"
import FloatingParticles from "./FloatingParticles"
import ParticleSystem from "./ParticleSystem"
import { AuroraGlow } from "./GlowEffects"

interface InteractiveBackgroundProps {
  className?: string
  enableLiquidGrass?: boolean
  enableFloatingParticles?: boolean
  enableParticleSystem?: boolean
  enableAurora?: boolean
  theme?: "emerald" | "blue" | "purple" | "custom"
  customColors?: string[]
}

const InteractiveBackground = ({
  className = "",
  enableLiquidGrass = true,
  enableFloatingParticles = true,
  enableParticleSystem = true,
  enableAurora = false,
  theme = "emerald",
  customColors,
}: InteractiveBackgroundProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Delay rendering to avoid hydration issues
    setIsVisible(true)
  }, [])

  const getThemeColors = () => {
    if (customColors) return customColors

    switch (theme) {
      case "emerald":
        return ["#10b981", "#059669", "#047857", "#065f46", "#34d399"]
      case "blue":
        return ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#60a5fa"]
      case "purple":
        return ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#a78bfa"]
      default:
        return ["#10b981", "#059669", "#047857", "#065f46", "#34d399"]
    }
  }

  const colors = getThemeColors()

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Aurora background layer */}
      {enableAurora && (
        <div className="absolute inset-0 z-0">
          <AuroraGlow colors={colors} />
        </div>
      )}

      {/* Liquid grass background layer */}
      {enableLiquidGrass && (
        <div className="absolute inset-0 z-1">
          <LiquidGrassBackground />
        </div>
      )}

      {/* Floating particles layer */}
      {enableFloatingParticles && (
        <div className="absolute inset-0 z-2">
          <FloatingParticles particleCount={30} colors={colors} />
        </div>
      )}

      {/* Interactive particle system layer */}
      {enableParticleSystem && (
        <div className="absolute inset-0 z-3">
          <ParticleSystem
            particleCount={60}
            colors={colors}
            interactive={true}
            mouseAttraction={true}
            connectionLines={true}
            particleTypes={["dot", "star", "diamond", "triangle"]}
          />
        </div>
      )}
    </div>
  )
}

export default InteractiveBackground