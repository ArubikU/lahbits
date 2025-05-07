"use client"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { API_URLS, fetcherWithCache } from "@/hooks/use-api"
import { requireAuth } from "@/lib/auth"
import { Stat, StatCategory, User } from "@/types"
import { useEffect, useState } from "react"
import StatForm from "./stat-form"
import StatList from "./stat-list"

export default  function StatsPage() {
  const session = requireAuth()


  const [stats, setStats] = useState<Stat[]>([])
  const [categories, setCategories] = useState<StatCategory[]>([])
  const [user,setUser] = useState<User>();
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
    const fetchCategories = async () => {
      const data = await fetcherWithCache(API_URLS.USER.STATS_CATEGORIES)
      
      setCategories(data.result)
    }

    fetchUser()
    fetchStats()
    fetchCategories()
  }, [])

  if(!user){
    
  return (
    <div className="flex min-h-screen">
      <ProfileSidebar user={user} stats={stats} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Gestión de Estadísticas</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
          <div className="h-[240px] rounded bg-white/5 animate-pulse" />
        </div>
          </div>
        </div>
      </main>
    </div>
  )
  }

  return (
    <div className="flex min-h-screen">
      <ProfileSidebar user={user} stats={stats} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Gestión de Estadísticas</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Crear Nueva Estadística</h2>
              {(categories.length > 0) ? (<StatForm userId={user?.id!} categories={categories} setStats={setStats}/>) : (
                <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">
                  No hay categorías disponibles para crear estadísticas.
                </div>
              )}
            </div>
              
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Tus Estadísticas</h2>
              {(stats && stats.length > 0) ? (<StatList stats={stats} userId={user?.id!} setStats={setStats}/>) : (
                <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">
                  No tienes estadísticas creadas. Crea una nueva estadística para empezar a rastrear tu progreso.
                  </div>)}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
