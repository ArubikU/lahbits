"use client"

import { API_URLS, poster } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import type { MarketplaceItem, Purchase, User } from "@/types"
import { Eye, EyeOff, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface MarketplaceItemListProps {
  items: MarketplaceItem[]
  user?: User
  setItems?: React.Dispatch<React.SetStateAction<MarketplaceItem[]>>
  setPurchases?: React.Dispatch<React.SetStateAction<Purchase[]>>
}

export default function MarketplaceItemList({ items, user,setItems,setPurchases }: MarketplaceItemListProps) {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const userId = user ? user.id : 0

  const handlePurchase = async (itemId: number) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await poster(API_URLS.MARKETPLACE.PURCHASE, {
        objectbody: {
          userId,
          id: itemId,
        }
      }
      )

      if (result.success) {
        setSuccess(`¡Has comprado "${result.item_name}" por ${result.price} oro!`)
        if (setPurchases) {
          setPurchases((prev) => [...prev, result.result])
          apiCache.override<Purchase[]>(API_URLS.USER.MARKETPLACE_PURCHASES, (prev) => [...prev, result.result])
        }
      } else {
        setError(result.message || "Error al realizar la compra")
      }
    } catch (error) {
      setError("Error al realizar la compra")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (itemId: number) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await poster(API_URLS.MARKETPLACE.TOGGLE, {  
        objectbody: {
          userId,
          id: itemId,
        }
      }
      )


      if (result.success) {
        setSuccess(`¡Has ${result.is_active ? "activado" : "desactivado"} "${result.item_name}"!`)
        if (setItems) {
          setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, is_active: result.is_active } : item)))
        }
        setError(result.message || "Error al cambiar el estado del producto")
      }
    } catch (error) {
      setError("Error al cambiar el estado del producto")
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar items activos e inactivos
  const activeItems = items.filter((item) => item.is_active)
  const inactiveItems = items.filter((item) => !item.is_active)

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}
      {success && (
        <div className="p-3 bg-green-900/50 border border-green-800 rounded-lg text-sm text-white">{success}</div>
      )}

      <div>
        <h3 className="text-md font-medium text-gray-300 mb-3">Productos Activos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeItems.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-2">No hay productos activos</p>
          ) : (
            activeItems.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-white">{item.name}</h4>
                    {item.description && <p className="text-sm text-gray-400 mt-1">{item.description}</p>}

                    <div className="flex items-center mt-2 space-x-4">
                      <div className="text-yellow-500">{item.price} oro</div>
                      {item.max_purchases && (
                        <div className="text-xs text-gray-400">
                          {item.times_purchased}/{item.max_purchases} compras
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePurchase(item.id)}
                      disabled={isLoading || (item.max_purchases !== null && item.times_purchased >= (item.max_purchases||0))}
                      className="p-2 rounded-full bg-gray-700 hover:bg-green-600 text-white transition-colors"
                      title="Comprar"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleActive(item.id)}
                      disabled={isLoading}
                      className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                      title="Desactivar"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-300 mb-3">Productos Inactivos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inactiveItems.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-2">No hay productos inactivos</p>
          ) : (
            inactiveItems.map((item) => (
              <div key={item.id} className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-400">{item.name}</h4>
                    {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}

                    <div className="flex items-center mt-2 space-x-4">
                      <div className="text-yellow-500/50">{item.price} oro</div>
                      {item.max_purchases && (
                        <div className="text-xs text-gray-500">
                          {item.times_purchased}/{item.max_purchases} compras
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActive(item.id)}
                    disabled={isLoading}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    title="Activar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
