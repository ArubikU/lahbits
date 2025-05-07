"use client"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { API_URLS, fetcherWithCache, poster } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import { requireAuth } from "@/lib/auth"
import { Stat, Streak, StreakBonus, User } from "@/types"
import { useEffect, useState } from "react"
import StreakSettings from "./streak-settings"

//export const metadata: Metadata = {
//  title: "Racha - Lahbits",
//  description: "Gestiona tu racha diaria, configura bonificaciones y mantén la consistencia en tus tareas.",
//}

export default function StreakPage() {
  const session = requireAuth()


  const [user,setUser] = useState<User>();
  const [stats,setStats] = useState<Stat[]>();
  const [streak,setStreak] = useState<Streak>();
  const [streakBonuses,setStreakBonuses] = useState<StreakBonus[]>();
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
    const fetchStreak = async () => {
      const data = await fetcherWithCache(API_URLS.USER.STREAK)
      
      setStreak(data.result)
    }
    const fetchStreakBonuses = async () => {
      const data = await fetcherWithCache(API_URLS.USER.STREAK_BONUSES)
      
      setStreakBonuses(data.result)
    }

    fetchUser()
    fetchStats()
    fetchStreak()
    fetchStreakBonuses()
  }, [])

  const handleRecover =  async (e: React.FormEvent) => {
      e.preventDefault()
      const data = await poster(API_URLS.USER.STREAK_RECOVER)
      if(data && data.success){
        setStreak(data.result)
        apiCache.override<Streak>(API_URLS.USER.STREAK,data.result)
      }
  }
  return (
    <div className="flex min-h-screen">
      <ProfileSidebar user={user} stats={stats} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Sistema de Racha</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Tu Racha Actual</h2>

              {streak ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-green-500">{streak.current_streak}</div>
                      <div className="text-sm text-gray-400 mt-1">días consecutivos</div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Racha máxima:</span>
                      <span className="text-sm text-white">{streak.max_streak} días</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Última actividad:</span>
                      <span className="text-sm text-white">
                        streak.last_activity_date
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Costo de recuperación:</span>
                      <span className="text-sm text-white">{streak.recovery_cost} oro</span>
                    </div>
                  </div>

                  {streak.current_streak < streak.max_streak && (
                    <form>
                      <button
                        type="submit"
                        className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
                        disabled={(user?.gold! | 0) < streak.recovery_cost}
                        onClick={handleRecover}
                      >
                        Recuperar racha máxima ({streak.recovery_cost} oro)
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-6 w-30 rounded border border-transparent animate-pulse bg-white/10"></div>
                      <div className="text-sm text-gray-400 mt-1">días consecutivos</div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Racha máxima:</span>
                      <div className="h-5 w-24 rounded border border-transparent animate-pulse bg-white/10"></div> <span className="text-sm text-white">días</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Última actividad:</span>
                      <div className="h-5 w-24 rounded border border-transparent animate-pulse bg-white/10"></div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Costo de recuperación:</span>
                      <div className="h-5 w-24 rounded border border-transparent animate-pulse bg-white/10"></div><span className="text-sm text-white"> oro</span>
                    </div>
                  </div>

                  <button
                        type="submit"
                        className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
                        disabled={true}
                      >
                        Recuperar racha máxima (<div className="h-5 w-24 rounded border border-transparent animate-pulse bg-white/10"></div> oro)
                      </button>
                </div>
              )}
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Bonificaciones por Racha</h2>

              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 text-sm">
                        <th className="pb-2">Días</th>
                        <th className="pb-2">Bonificación XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {streakBonuses ? (
                        streakBonuses.map((bonus) => (
                          <tr key={bonus.id} className="border-t border-gray-700">
                            <td className="py-2 text-sm">
                              {bonus.min_days} - {bonus.max_days || "∞"}
                            </td>
                            <td className="py-2 text-sm text-green-500">+{bonus.xp_bonus} XP</td>
                          </tr>
                        ))
                      ): (<></>)}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-400">
                    Completa tareas todos los días para mantener tu racha. Cuanto más larga sea tu racha, mayores serán
                    tus bonificaciones de XP.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {((user && streakBonuses) && (<div className="mt-6">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Configuración de Racha</h2>
              <StreakSettings
                streakBonuses={streakBonuses!}
                setStreakBonuses={setStreakBonuses}
                recoveryCost={streak?.recovery_cost || 50}
              />
            </div>
          </div>))}
        </div>
      </main>
    </div>
  )
}
