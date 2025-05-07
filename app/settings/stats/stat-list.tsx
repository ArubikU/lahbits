"use client"

import { ProgressBar } from "@/components/ui/progress-bar"
import { API_URLS, deleter, patcher } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import type { Stat } from "@/types"
import { Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface StatListProps {
  stats: Stat[]
  userId: string
  setStats?: React.Dispatch<React.SetStateAction<Stat[]>>
}

export default function StatList({ stats, userId, setStats }: StatListProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStat, setEditingStat] = useState<Stat | null>(null)
  const router = useRouter()

  const handleDelete = async (statId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta estadística?")) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await deleter(API_URLS.STATS.DELETE, {
        objectbody: {
          userId,
          statId,
        },
      })
      apiCache.override(API_URLS.USER.STATS, [...stats.filter((stat) => stat.id !== statId)])
      if (setStats) {
        setStats((prev) => prev.filter((stat) => stat.id !== statId))
      }
      if (result.success) {
        router.refresh()
      } else {
        setError(result.message || "Error al eliminar la estadística")
      }
    } catch (error) {
      setError("Error al eliminar la estadística")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (stat: Stat) => {
    setEditingStat(stat)
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (updatedStat: Stat) => {
    setIsLoading(true)
    setError("")
    updatedStat.current_value = stats.find((stat) => stat.id === updatedStat.id)?.current_value || 0

    try {
      const result = await patcher(API_URLS.STATS.UPDATE, {
        objectbody: {
          statId: updatedStat.id,
          ...updatedStat,
        },
      })
      if (result.success) {
        if (setStats) {
          setStats((prev) =>
            prev.map((stat) => (stat.id === updatedStat.id ? { ...stat, ...updatedStat } : stat)),
          )
        }
        setIsEditDialogOpen(false)
        router.refresh()
      } else {
        setError(result.message || "Error al actualizar la estadística")
      }
    } catch (error) {
      setError("Error al actualizar la estadística")
    } finally {
      setIsLoading(false)
    }
  }

  const statsByCategory = stats.reduce(
    (acc, stat) => {
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
    },
    {} as Record<string, { color: string; icon?: string; stats: Stat[] }>,
  )

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}

      {stats.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No hay estadísticas creadas</p>
      ) : (
        Object.entries(statsByCategory).map(([category, { color, icon, stats }]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center">
              {icon && (
                <span className="mr-2 text-lg" style={{ color }}>
                  {icon}
                </span>
              )}
              <h3 className="text-md font-medium text-white">{category}</h3>
            </div>

            <div className="space-y-3 pl-2 border-l-2" style={{ borderColor: color }}>
              {stats.map((stat) => (
                <div key={stat.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{stat.name}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(stat)}
                        className="p-1 rounded-full bg-gray-700 hover:bg-blue-600 text-white transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stat.id)}
                        disabled={isLoading}
                        className="p-1 rounded-full bg-gray-700 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <ProgressBar value={stat.current_value} max={stat.max_value} color={color} showText />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {isEditDialogOpen && editingStat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium text-white mb-4">Editar Estadística</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditSubmit(editingStat)
              }}
            >
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingStat.name}
                  onChange={(e) => setEditingStat({ ...editingStat, name: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
                <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Valor Actual</label>
                <input
                  type="number"
                  value={editingStat.current_value}
                  disabled
                  aria-disabled
                  className="w-full p-2 rounded bg-gray-900 text-gray-400 cursor-not-allowed"
                />
                </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Valor Máximo</label>
                <input
                  type="number"
                  value={editingStat.max_value}
                  onChange={(e) =>
                    setEditingStat({ ...editingStat, max_value: Number(e.target.value) })
                  }
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-500"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
