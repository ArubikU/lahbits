"use client"

import type { Stat } from "@/types"
import { useEffect, useRef } from "react"

interface RadarChartProps {
  stats: Stat[]
  size?: number
  color?: string
  backgroundColor?: string
  lineColor?: string
}

export function RadarChart({
  stats,
  size = 300,
  color = "#10b981",
  backgroundColor = "rgba(16, 185, 129, 0.1)",
  lineColor = "rgba(255, 255, 255, 0.2)",
}: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || stats.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    // Dibujar líneas de fondo
    const angleStep = (Math.PI * 2) / stats.length

    // Dibujar círculos concéntricos
    const levels = 5
    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius * i) / levels

      ctx.beginPath()
      ctx.arc(centerX, centerY, levelRadius, 0, Math.PI * 2)
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Dibujar líneas radiales
    for (let i = 0; i < stats.length; i++) {
      const angle = i * angleStep - Math.PI / 2 // Comenzar desde arriba
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1
      ctx.stroke()

      // Dibujar etiquetas
      const labelX = centerX + (radius + 20) * Math.cos(angle)
      const labelY = centerY + (radius + 20) * Math.sin(angle)

      ctx.fillStyle = "white"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(stats[i].name, labelX, labelY)
    }

    // Dibujar el polígono de datos
    ctx.beginPath()
    for (let i = 0; i < stats.length; i++) {
      const angle = i * angleStep - Math.PI / 2
      const value = stats[i].current_value / stats[i].max_value
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fillStyle = backgroundColor
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    // Dibujar puntos en los vértices
    for (let i = 0; i < stats.length; i++) {
      const angle = i * angleStep - Math.PI / 2
      const value = stats[i].current_value / stats[i].max_value
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    }
  }, [stats, size, color, backgroundColor, lineColor])

  return <canvas ref={canvasRef} width={size} height={size} className="mx-auto" />
}
