"use client"

import type { Stat } from "@/types"
import { useEffect, useState } from "react"
import { RadarChart } from "./ui/radar-chart"

interface StatsRadarProps {
  stats?: Stat[]
  accentColor?: string
}

export function StatsRadar({ stats, accentColor = "#10b981" }: StatsRadarProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [statsByCategory, setStatsByCategory] = useState<
    Record<string, { color: string; icon?: string; stats: Stat[] }>
  >({})
  const [categoryNames, setCategoryNames] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  useEffect(() => {
    if (!stats || stats.length === 0) return

    const mapped = stats.reduce((acc, stat) => {
      if (!stat.category) return acc
      if (!acc[stat.category.name]) {
        acc[stat.category.name] = {
          color: stat.category.color,
          icon: stat.category.icon,
          stats: [],
        }
      }
      acc[stat.category.name].stats.push(stat)
      return acc
    }, {} as Record<string, { color: string; icon?: string; stats: Stat[] }>)

    const names = Object.keys(mapped)
    setStatsByCategory(mapped)
    setCategoryNames(names)
    setSelectedCategory(names[0] || "")
    setIsLoading(false)
  }, [stats])

  const currentStats = statsByCategory[selectedCategory]?.stats.slice(0, 6) || []
  const currentColor = statsByCategory[selectedCategory]?.color || accentColor

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 min-h-[300px]">
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
          <div className="h-[240px] rounded bg-white/5 animate-pulse" />
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Estadísticas</h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 text-white rounded px-2 py-1"
            >
              {categoryNames.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <RadarChart
            stats={currentStats}
            color={currentColor}
            backgroundColor={`${currentColor}20`}
          />
        </>
      )}
    </div>
  )
}
