"use client"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { StatsRadar } from "@/components/stats-radar"
import { StreakCounter } from "@/components/streak-counter"
import { TaskList } from "@/components/task-list"
import { API_URLS, fetcherWithCache } from "@/hooks/use-api"
import { requireAuth } from "@/lib/auth"
import { Stat, Streak, Task, User } from "@/types"
import Head from 'next/head'
import { useEffect, useState } from "react"


export default function DashboardPage() {

  const session = requireAuth()



  const [stats, setStats] = useState<Stat[]>()
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [streak, setStreak] = useState<Streak>()
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
    const fetchPendingTasks = async () => {
      const data = await fetcherWithCache(API_URLS.USER.TASKS_UNCOMPLETED)
      
      setPendingTasks(data.result)
    }
    const fetchCompletedTasks = async () => {
      const data = await fetcherWithCache(API_URLS.USER.TASKS_COMPLETED)
      
      setCompletedTasks(data.result)
    }

    const fetchStreak = async () => {
      const data = await fetcherWithCache(API_URLS.USER.STREAK)
      
      setStreak(data.result)
    }

    fetchUser()
    fetchStats()
    fetchPendingTasks()
    fetchCompletedTasks()
    fetchStreak()
  }, [])

  const streakComponent = () => {
    if(streak){
      if(streak.current_streak > 0){
        return <StreakCounter streak={streak.current_streak}  className="mt-2 md:mt-0" />
      }
    }
    return null
  }

  return (
    <>
        <Head>
    <title>Dashboard - Lahbits</title>
    <meta name="description" content="Tu panel de control personalizado para seguir tu progreso y completar tareas." />
    
  </Head>
    <div className="flex min-h-screen">
      <ProfileSidebar user={user} stats={stats} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {streakComponent()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
              <StatsRadar stats={stats} />
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Tareas Pendientes</h2>
              <TaskList tasks={pendingTasks} />
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Tareas Completadas Recientemente</h2>
              <TaskList tasks={completedTasks.slice(0, 5)} />
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
