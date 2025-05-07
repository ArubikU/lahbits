"use client"

import type React from "react"

import ColorPicker from "@/components/custom/color-picker"
import EmojiPicker from "@/components/custom/emoji-picker"
import { API_URLS, poster } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import { StatCategory } from "@/types"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CategoryFormProps {
  userId: string
  setCategories?: React.Dispatch<React.SetStateAction<StatCategory[]>>
}

const PRESET_ICONS = ["💼", "📚", "🗣️", "💪", "🎨", "🧠", "🌍", "🎯", "🎮", "🎵", "🍳", "🏠"]
const PRESET_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
  "#f43f5e",
  "#8b5cf6",
  "#22c55e",
  "#f97316",
]

export default function CategoryForm({ userId, setCategories }: CategoryFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState(PRESET_ICONS[0])
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!name) {
      setError("El nombre es obligatorio")
      setIsLoading(false)
      return
    }

    try {
      const result = await poster(API_URLS.CATEGORIES.CREATE, {
        objectbody: {
          userId,
          name,
          description,
          icon,
          color,
        },
      })

      if (result.success) {
        setName("")
        setDescription("")
        setIcon(PRESET_ICONS[0])
        setColor(PRESET_COLORS[0])
        apiCache.override<StatCategory[]>(API_URLS.USER.STATS_CATEGORIES, (prev) => [...prev, result.result])
        if(setCategories){
          setCategories((prev) => [...prev, result.result])
        }
      } else {
        setError(result.message || "Error al crear la categoría")
      }
    } catch (error) {
      setError("Error al crear la categoría")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleCreateCategory} className="space-y-4">
      {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
          Nombre
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Ej: Trabajo"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
          Descripción (opcional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Ej: Tareas relacionadas con el trabajo"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Icono</label>
        <div className="grid grid-cols-6 gap-2">
          <EmojiPicker
            value={icon}
            onChange={setIcon}
            presetEmojis={PRESET_ICONS}
            showPresets={true}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Color</label>
        <div className="grid grid-cols-6 gap-2">
          <ColorPicker
            value={color}
            onChange={setColor}
            presetColors={PRESET_COLORS}
            showPresets={true}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? "Creando..." : "Crear Categoría"}
        </button>
      </div>
    </form>
  )
}
