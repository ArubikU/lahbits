"use client"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { API_URLS, fetcherWithCache } from "@/hooks/use-api"
import { requireAuth } from "@/lib/auth"
import { MarketplaceItem, Purchase, Stat, User } from "@/types"
import { useEffect, useState } from "react"
import MarketplaceItemForm from "./marketplace-item-form"
import MarketplaceItemList from "./marketplace-item-list"

export default function MarketplacePage() {
  const session = requireAuth()


  const [stats, setStats] = useState<Stat[]>([])
  const [user,setUser] = useState<User>();
  const [items,setItems] = useState<MarketplaceItem[]>([])
  const [purchases,setPurchases] = useState<Purchase[]>([])
  const [isMarketplaceFormOpen, setIsMarketplaceFormOpen] = useState(false)
  //call api url async
  useEffect(() => {
    const fetchUser = async () => {
      const data = await fetcherWithCache(API_URLS.USER.GET)
      
      setUser(data.result)
    }
    const fetchStats = async () => {
      const data = await fetcherWithCache(API_URLS.USER.STATS)
      
      setStats(data.result)
    }
    const fetchItems = async () => {
      const data = await fetcherWithCache(API_URLS.USER.MARKETPLACE_ITEMS)
      
      setItems(data.result)
    }
    const fetchPurchases = async () => {
      const data = await fetcherWithCache(API_URLS.USER.MARKETPLACE_PURCHASES)
      
      setPurchases(data.result)
    }
    

    fetchUser()
    fetchStats()
    fetchItems()
    fetchPurchases()
  }, [])
  

  return (
    <div className="flex min-h-screen">
      <ProfileSidebar user={user} stats={stats} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Marketplace</h1>

            <button
              className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => setIsMarketplaceFormOpen(true)}
            >
              Crear nuevo producto
            </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Historial de Compras</h2>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {purchases.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No has realizado compras</p>
                ) : (
                  purchases.map((purchase) => (
                    <div key={purchase.id} className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white">{purchase.item?.name || "Producto eliminado"}</h3>
                          {purchase.item?.description && (
                            <p className="text-sm text-gray-400 mt-1">{purchase.item.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {purchase.purchased_at.toLocaleDateString()} {purchase.purchased_at.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-yellow-500 text-sm">{purchase.price_paid} oro</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Tus Productos</h2>
              <MarketplaceItemList items={items} user={user} setItems={setItems} setPurchases={setPurchases}/>
            </div>
          </div>
        </div>
      </main>
              {/* Panel de creación de tareas */}
              {isMarketplaceFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 p-6 rounded-lg w-96 relative">
                    {/* Botón para cerrar el panel */}
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
                      onClick={() => setIsMarketplaceFormOpen(false)}
                      aria-label="Cerrar"
                    >
                      &times;
                    </button>
                    <div className="bg-gray-900/50 rounded-xl p-6">
                      <h2 className="text-lg font-semibold mb-4">Crear Nuevo Producto</h2>
                      <MarketplaceItemForm user={user} setItems={setItems} setPurchases={setPurchases}/>
                    </div>
                  </div>
                </div>
              )}
    </div>
  )
}
