"use client"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { TaskList } from "@/components/task-list"
import { API_URLS, fetcher, fetcherWithCache } from "@/hooks/use-api"
import { requireAuth } from "@/lib/auth"
import { Stat, Task, User } from "@/types"
import Head from "next/head"
import { useEffect, useState } from "react"
import TaskForm from "./task-form"

export default function TasksPage() {
  const session = requireAuth()


  const [stats, setStats] = useState<Stat[]>()
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
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
      const data = await fetcher(API_URLS.USER.TASKS_UNCOMPLETED)
      
      setPendingTasks(data.result)
    }
    const fetchCompletedTasks = async () => {
      const data = await fetcher(API_URLS.USER.TASKS_COMPLETED)
      setCompletedTasks(data.result)
    }

    fetchUser()
    fetchStats()
    fetchPendingTasks()
    fetchCompletedTasks()
  }, [])

  return (
    <>
    <Head>
      <title>Tareas - Lahbits</title>
      <meta name="description" content="Gestiona tus tareas, crea nuevas y completa objetivos para ganar XP y mejorar tus estadísticas." />
    </Head>
    <div className="flex min-h-screen">
      <ProfileSidebar user={user} stats={stats} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Tareas</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Crear Nueva Tarea</h2>
              <TaskForm userId={user?.id} stats={stats} setTasks={setPendingTasks} tasks={[...pendingTasks, ...completedTasks]}  />
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Tareas Pendientes</h2>
              <TaskList tasks={pendingTasks} setUncompletedTasks={setPendingTasks} setCompletedTasks={setCompletedTasks} setUser={setUser}/>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Tareas Completadas</h2>
              <TaskList tasks={completedTasks} setUncompletedTasks={setPendingTasks} setCompletedTasks={setCompletedTasks}  setUser={setUser}/>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
