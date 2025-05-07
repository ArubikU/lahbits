"use client"

import type React from "react"

import { API_URLS, poster } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import { MarketplaceItem, Purchase, User } from "@/types"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface MarketplaceItemFormProps {
  user?: User
      setItems?: React.Dispatch<React.SetStateAction<MarketplaceItem[]>>
      setPurchases?: React.Dispatch<React.SetStateAction<Purchase[]>>
}

export default function MarketplaceItemForm({ user,setItems,setPurchases }: MarketplaceItemFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(50)
  const [maxPurchases, setMaxPurchases] = useState<string>("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const userId = user ? user.id : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!name || !price) {
      setError("El nombre y el precio son obligatorios")
      setIsLoading(false)
      return
    }

    try {
      const result = await poster(API_URLS.MARKETPLACE.CREATE, {
        objectbody: {
          userId,
          name,
          description,
          price,
          maxPurchases: maxPurchases ? parseInt(maxPurchases) : undefined,
        }
      })

      if (result.success) {
        setName("")
        setDescription("")
        setPrice(50)
        setMaxPurchases("")

        apiCache.override<MarketplaceItem[]>(API_URLS.USER.MARKETPLACE_ITEMS, (prev) => {
          return [...prev, result.result]
        })
        if (setItems) {
          setItems((prev) => [...prev, result.result])
        }
        
        
      } else {
        setError(result.message || "Error al crear el producto")
      }
    } catch (error) {
      setError("Error al crear el producto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
          Nombre del producto
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Ej: Día libre"
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
          placeholder="Ej: Tómate un día libre sin perder tu racha"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-400 mb-1">
          Precio (oro)
        </label>
        <input
          id="price"
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(Number.parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="maxPurchases" className="block text-sm font-medium text-gray-400 mb-1">
          Límite de compras (opcional)
        </label>
        <input
          id="maxPurchases"
          type="number"
          min="1"
          value={maxPurchases}
          onChange={(e) => setMaxPurchases(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Vacío = sin límite"
        />
        <p className="mt-1 text-xs text-gray-500">Deja vacío para permitir compras ilimitadas</p>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? "Creando..." : "Crear Producto"}
        </button>
      </div>
    </form>
  )
}
