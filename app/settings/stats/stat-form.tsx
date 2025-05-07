"use client"

import type React from "react"

import { API_URLS, poster } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import { Stat, type StatCategory } from "@/types"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface StatFormProps {
  userId: string
  categories: StatCategory[]
  setStats?: React.Dispatch<React.SetStateAction<Stat[]>>;
}

export default function StatForm({ userId, categories,setStats }: StatFormProps) {
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState<number | "">("")
  const [currentValue, setCurrentValue] = useState(0)
  const [maxValue, setMaxValue] = useState(100)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!name || categoryId === "") {
      setError("El nombre y la categoría son obligatorios")
      setIsLoading(false)
      return
    }


    try {
      const result = await poster(API_URLS.STATS.CREATE,{objectbody: {
        userId,
        name,
        categoryId,
        currentValue,
        maxValue
      }})

      if (result.success) {
        setName("")
        setCategoryId("")
        setCurrentValue(0)
        setMaxValue(100)

        let tempStat = result.result
        tempStat.category = categories.find((cat) => cat.id === tempStat.categoryId) || {
          id: 0,
          name: "",
        }
        tempStat.currentValue = 0
        if(setStats){
          setStats((prev) => [...prev, tempStat])
        }
        apiCache.override<Stat[]>(API_URLS.USER.STATS, (prev) => [...prev, tempStat])
      } else {
        setError(result.message || "Error al crear la estadística")
      }
    } catch (error) {
      setError("Error al crear la estadística")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Ej: Productividad"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-400 mb-1">
          Categoría
        </label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value ? Number.parseInt(e.target.value) : "")}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {categories.length === 0 && (
          <p className="mt-1 text-xs text-yellow-500">No tienes categorías. Crea una categoría primero.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="currentValue" className="block text-sm font-medium text-gray-400 mb-1">
            Valor actual
          </label>
          <input
            id="currentValue"
            type="number"
            min="0"
            max={maxValue}
            value={currentValue}
            onChange={(e) => setCurrentValue(Number.parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="maxValue" className="block text-sm font-medium text-gray-400 mb-1">
            Valor máximo
          </label>
          <input
            id="maxValue"
            type="number"
            min="1"
            value={maxValue}
            onChange={(e) => setMaxValue(Number.parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || categories.length === 0}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? "Creando..." : "Crear Estadística"}
        </button>
      </div>
    </form>
  )
}
