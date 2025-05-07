"use client"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { API_URLS, fetcherWithCache } from "@/hooks/use-api"
import { requireAuth } from "@/lib/auth"
import { Stat, User } from "@/types"
import { useEffect, useState } from "react"
import ProfileForm from "./profile-form"
export default function ProfilePage() {
  const session = requireAuth()


  const [user,setUser] = useState<User>();
  const [stats,setStats] = useState<Stat[]>();
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

    fetchUser()
    fetchStats()
  }, [])


  const isUserComponent = () => {
    if (user) {
      return (<ProfileForm user={user} setUser={setUser} />)
    }
    return (
        <div className="flex flex-col gap-4">
          <div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
          <div className="h-[240px] rounded bg-white/5 animate-pulse" />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <ProfileSidebar user={user} stats={stats} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Perfil</h1>

          <div className="bg-gray-900/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Editar Perfil</h2>
            {isUserComponent()}
          </div>
        </div>
      </main>
    </div>
  )
}
