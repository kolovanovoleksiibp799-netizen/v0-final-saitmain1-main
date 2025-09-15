"use client"

import { useEffect, useRef, useCallback } from "react"

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
  type: "dot" | "star" | "diamond" | "triangle"
  rotation: number
  rotationSpeed: number
  pulsePhase: number
  trail: Array<{ x: number; y: number; opacity: number }>
}

interface ParticleSystemProps {
  particleCount?: number
  colors?: string[]
  className?: string
  interactive?: boolean
  mouseAttraction?: boolean
  connectionLines?: boolean
  particleTypes?: Array<"dot" | "star" | "diamond" | "triangle">
}

const ParticleSystem = ({
  particleCount = 80,
  colors = ["#10b981", "#059669", "#047857", "#065f46", "#34d399"],
  className = "",
  interactive = true,
  mouseAttraction = true,
  connectionLines = true,
  particleTypes = ["dot", "star", "diamond", "triangle"],
}: ParticleSystemProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, isMoving: false })
  const timeRef = useRef(0)

  const createParticle = useCallback(
    (id: number, canvas: HTMLCanvasElement): Particle => {
      return {
        id,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 500 + 300,
        type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
        trail: [],
      }
    },
    [colors, particleTypes],
  )

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle, time: number) => {
    ctx.save()

    // Update pulse effect
    const pulseIntensity = Math.sin(time * 0.01 + particle.pulsePhase) * 0.3 + 0.7
    const currentOpacity = particle.opacity * pulseIntensity

    ctx.globalAlpha = currentOpacity
    ctx.translate(particle.x, particle.y)
    ctx.rotate(particle.rotation)

    // Draw particle trail
    if (particle.trail.length > 0) {
      ctx.globalAlpha = currentOpacity * 0.3
      for (let i = 0; i < particle.trail.length; i++) {
        const trailPoint = particle.trail[i]
        const trailOpacity = (i / particle.trail.length) * currentOpacity * 0.5
        ctx.globalAlpha = trailOpacity

        ctx.beginPath()
        ctx.arc(trailPoint.x - particle.x, trailPoint.y - particle.y, particle.size * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      }
      ctx.globalAlpha = currentOpacity
    }

    // Draw main particle based on type
    ctx.fillStyle = particle.color
    ctx.strokeStyle = particle.color
    ctx.lineWidth = 1

    switch (particle.type) {
      case "dot":
        // Outer glow
        ctx.shadowColor = particle.color
        ctx.shadowBlur = particle.size * 3
        ctx.beginPath()
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Inner bright core
        ctx.shadowBlur = 0
        ctx.globalAlpha = currentOpacity * 1.5
        ctx.beginPath()
        ctx.arc(0, 0, particle.size * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"
        ctx.fill()
        break

      case "star":
        ctx.shadowColor = particle.color
        ctx.shadowBlur = particle.size * 2
        ctx.beginPath()
        const spikes = 5
        const outerRadius = particle.size
        const innerRadius = particle.size * 0.4

        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const angle = (i * Math.PI) / spikes
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break

      case "diamond":
        ctx.shadowColor = particle.color
        ctx.shadowBlur = particle.size * 2
        ctx.beginPath()
        ctx.moveTo(0, -particle.size)
        ctx.lineTo(particle.size, 0)
        ctx.lineTo(0, particle.size)
        ctx.lineTo(-particle.size, 0)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break

      case "triangle":
        ctx.shadowColor = particle.color
        ctx.shadowBlur = particle.size * 2
        ctx.beginPath()
        ctx.moveTo(0, -particle.size)
        ctx.lineTo(particle.size * 0.866, particle.size * 0.5)
        ctx.lineTo(-particle.size * 0.866, particle.size * 0.5)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break
    }

    ctx.restore()
  }, [])

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    const maxDistance = 120
    ctx.strokeStyle = "#10b981"
    ctx.lineWidth = 0.5

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.3
          ctx.globalAlpha = opacity

          // Create gradient line
          const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y)
          gradient.addColorStop(0, particles[i].color + "40")
          gradient.addColorStop(1, particles[j].color + "40")
          ctx.strokeStyle = gradient

          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
    ctx.globalAlpha = 1
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => createParticle(i, canvas))

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.isMoving = true

      setTimeout(() => {
        mouseRef.current.isMoving = false
      }, 100)
    }

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove)
    }

    const animate = () => {
      timeRef.current += 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update trail
        particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity })
        if (particle.trail.length > 8) {
          particle.trail.shift()
        }

        // Mouse attraction
        if (mouseAttraction && mouseRef.current.isMoving) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const force = (150 - distance) / 150
            particle.vx += (dx / distance) * force * 0.01
            particle.vy += (dy / distance) * force * 0.01
          }
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationSpeed
        particle.life++

        // Apply gentle drift
        particle.vx += (Math.random() - 0.5) * 0.01
        particle.vy += (Math.random() - 0.5) * 0.01

        // Limit velocity
        const maxVelocity = 2
        const velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
        if (velocity > maxVelocity) {
          particle.vx = (particle.vx / velocity) * maxVelocity
          particle.vy = (particle.vy / velocity) * maxVelocity
        }

        // Boundary wrapping with smooth transition
        const margin = 50
        if (particle.x < -margin) particle.x = canvas.width + margin
        if (particle.x > canvas.width + margin) particle.x = -margin
        if (particle.y < -margin) particle.y = canvas.height + margin
        if (particle.y > canvas.height + margin) particle.y = -margin

        // Update opacity based on life
        const lifeRatio = particle.life / particle.maxLife
        particle.opacity = Math.max(0.1, 0.8 * (1 - lifeRatio))

        // Reset particle if life exceeded
        if (particle.life >= particle.maxLife) {
          const newParticle = createParticle(particle.id, canvas)
          Object.assign(particle, newParticle)
        }

        // Draw particle
        drawParticle(ctx, particle, timeRef.current)
      })

      // Draw connection lines
      if (connectionLines) {
        drawConnections(ctx, particlesRef.current)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    particleCount,
    colors,
    interactive,
    mouseAttraction,
    connectionLines,
    createParticle,
    drawParticle,
    drawConnections,
  ])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-5 ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  )
}

export default ParticleSystem