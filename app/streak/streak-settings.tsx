"use client"

import type React from "react"

import { API_URLS, poster } from "@/hooks/use-api"
import type { StreakBonus } from "@/types"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface StreakSettingsProps {
  streakBonuses: StreakBonus[]
  setStreakBonuses: React.Dispatch<StreakBonus[]>
  recoveryCost: number
}

export default function StreakSettings({  streakBonuses,setStreakBonuses, recoveryCost }: StreakSettingsProps) {

  const [cost, setCost] = useState(recoveryCost)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAddBonus = () => {
    // Encontrar el valor máximo actual para establecer el nuevo mínimo
    let maxValue: undefined | number;

    streakBonuses.forEach(bonus=>{

      if(bonus.max_days){
        if(maxValue){
          if(maxValue<bonus.max_days){}
        }else{
          maxValue=bonus.max_days
        }
      }

    })

    if(maxValue){
      setStreakBonuses([...streakBonuses, { min_days: maxValue + 1, max_days: maxValue + 25, xp_bonus: 5 } as StreakBonus])
    }
    else{
      setStreakBonuses([...streakBonuses, { min_days: 1, max_days: 25, xp_bonus: 5 } as StreakBonus])
    }
  }

  const handleRemoveBonus = (index: number) => {
    setStreakBonuses(streakBonuses.filter((_, i) => i !== index))
  }

  const handleBonusChange = (index: number, field: "min_days" | "max_days" | "xp_bonus", value: string) => {
    const newBonuses = [...streakBonuses]

    if (field === "max_days" && value === "") {
      delete newBonuses[index].max_days
    } else {
      const numValue = Number.parseInt(value)
      if (!isNaN(numValue)) {
        newBonuses[index][field] = numValue
      }
    }

    setStreakBonuses(newBonuses)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validar que los rangos no se superpongan
    const sortedBonuses = [...streakBonuses].sort((a, b) => a.min_days - b.min_days)

    for (let i = 0; i < sortedBonuses.length - 1; i++) {
      const current = sortedBonuses[i]
      const next = sortedBonuses[i + 1]

      if (current.max_days === null || (current.max_days && current.max_days >= next.min_days)) {
        setError("Los rangos de días no pueden superponerse")
        setIsLoading(false)
        return
      }
    }

    try {
      const result = await poster(API_URLS.USER.STREAK_UPDATE,{objectbody: {
        recoveryCost: cost,
        bonusRanges: streakBonuses
      }})

      if (result.success) {
        router.refresh()
      } else {
        setError(result.message || "Error al actualizar la configuración")
      }
    } catch (error) {
      setError("Error al actualizar la configuración")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}

      <div>
        <label htmlFor="recoveryCost" className="block text-sm font-medium text-gray-400 mb-1">
          Costo de recuperación de racha (oro)
        </label>
        <input
          id="recoveryCost"
          type="number"
          value={cost}
          onChange={(e) => setCost(Number.parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-400">Bonificaciones por racha</label>
          <button type="button" onClick={handleAddBonus} className="text-sm text-green-500 hover:text-green-400">
            + Añadir rango
          </button>
        </div>

        <div className="space-y-3">
          {streakBonuses && streakBonuses.map((xp_bonus, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div>
                  <input
                    type="number"
                    value={xp_bonus.min_days}
                    onChange={(e) => handleBonusChange(index, "min_days", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Mín"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={xp_bonus.max_days === null ? "" : xp_bonus.max_days}
                    onChange={(e) => handleBonusChange(index, "max_days", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Máx (vacío = infinito)"
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-400">+</span>
                  <input
                    type="number"
                    value={xp_bonus.xp_bonus}
                    onChange={(e) => handleBonusChange(index, "xp_bonus", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="XP"
                  />
                  <span className="ml-2 text-gray-400">XP</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveBonus(index)}
                className="p-2 text-gray-400 hover:text-red-500"
                disabled={streakBonuses.length <= 1}
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? "Guardando..." : "Guardar Configuración"}
        </button>
      </div>
    </form>
  )
}
