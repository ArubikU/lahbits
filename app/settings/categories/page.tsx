"use client"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { API_URLS, fetcherWithCache } from "@/hooks/use-api"
import { requireAuth } from "@/lib/auth"
import { Stat, StatCategory, User } from "@/types"
import { useEffect, useState } from "react"
import CategoryForm from "./category-form"
import CategoryList from "./category-list"


export default function CategoriesPage() {
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
          <h1 className="text-2xl font-bold mb-6">Gestión de Categorías</h1>

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
          <h1 className="text-2xl font-bold mb-6">Gestión de Categorías</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Crear Nueva Categoría</h2>
              <CategoryForm userId={user.id} setCategories={setCategories} />
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Tus Categorías</h2>
              <CategoryList categories={categories} userId={user.id} setCategories={setCategories}/>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
