"use client"

import { useEffect, useRef } from "react"

interface LiquidGrassBackgroundProps {
  className?: string
}

const LiquidGrassBackground = ({ className = "" }: LiquidGrassBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Liquid grass animation parameters
    let time = 0
    const waves: Array<{
      amplitude: number
      frequency: number
      phase: number
      speed: number
      color: string
      opacity: number
    }> = [
      { amplitude: 30, frequency: 0.02, phase: 0, speed: 0.01, color: "#10b981", opacity: 0.1 },
      { amplitude: 25, frequency: 0.025, phase: Math.PI / 3, speed: 0.015, color: "#059669", opacity: 0.08 },
      { amplitude: 35, frequency: 0.015, phase: Math.PI / 2, speed: 0.008, color: "#047857", opacity: 0.06 },
      { amplitude: 20, frequency: 0.03, phase: Math.PI, speed: 0.012, color: "#065f46", opacity: 0.04 },
    ]

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.02)")
      gradient.addColorStop(0.5, "rgba(5, 150, 105, 0.04)")
      gradient.addColorStop(1, "rgba(4, 120, 87, 0.06)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw liquid grass waves
      waves.forEach((wave, index) => {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height)

        // Create flowing wave path
        for (let x = 0; x <= canvas.width; x += 2) {
          const y =
            canvas.height -
            100 -
            index * 20 +
            Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude +
            Math.sin(x * wave.frequency * 2 + time * wave.speed * 1.5) * (wave.amplitude * 0.3) +
            Math.cos(x * wave.frequency * 0.5 + time * wave.speed * 0.8) * (wave.amplitude * 0.5)

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        // Complete the shape
        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()

        // Apply gradient fill
        const waveGradient = ctx.createLinearGradient(0, canvas.height - 200, 0, canvas.height)
        waveGradient.addColorStop(
          0,
          `${wave.color}${Math.floor(wave.opacity * 255)
            .toString(16)
            .padStart(2, "0")}`,
        )
        waveGradient.addColorStop(
          1,
          `${wave.color}${Math.floor(wave.opacity * 0.3 * 255)
            .toString(16)
            .padStart(2, "0")}`,
        )

        ctx.fillStyle = waveGradient
        ctx.fill()

        // Add subtle glow effect
        ctx.shadowColor = wave.color
        ctx.shadowBlur = 20
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = -5
        ctx.fill()

        // Reset shadow
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      })

      // Add floating particles
      const particleCount = 15
      for (let i = 0; i < particleCount; i++) {
        const x = (i / particleCount) * canvas.width + Math.sin(time * 0.005 + i) * 50
        const y = canvas.height - 150 + Math.sin(time * 0.008 + i * 2) * 30
        const size = 2 + Math.sin(time * 0.01 + i) * 1

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + Math.sin(time * 0.01 + i) * 0.2})`
        ctx.fill()

        // Add glow to particles
        ctx.shadowColor = "#10b981"
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
      }

      time += 1
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ mixBlendMode: "multiply" }}
    />
  )
}

export default LiquidGrassBackground
