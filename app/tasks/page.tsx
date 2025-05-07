"use client"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { TaskList } from "@/components/task-list"
import { API_URLS, fetcher, fetcherWithCache } from "@/hooks/use-api"
import { requireAuth } from "@/lib/auth"
import { Stat, StatCategory, Task, User } from "@/types"
import Head from "next/head"
import { useEffect, useState } from "react"
import EditTaskForm from "./edit-task-form"
import TaskForm from "./task-form"

export default function TasksPage() {
  const session = requireAuth()

  const [stats, setStats] = useState<Stat[]>()
  const [categories, setCategories] = useState<StatCategory[]>([])
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [user, setUser] = useState<User>();
  const [editTask, setEditTask] = useState<Task | null>(null)

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
    const fetchCategories = async () => {
      const data = await fetcherWithCache(API_URLS.USER.STATS_CATEGORIES)
      setCategories(data.result)
    }

    fetchUser()
    fetchStats()
    fetchPendingTasks()
    fetchCompletedTasks()
    fetchCategories()
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

            {/* Botón para abrir el panel de creación de tareas */}
            <button
              className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => setIsTaskFormOpen(true)}
            >
              Crear Nueva Tarea
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Tareas Pendientes</h2>
                <TaskList stats={stats} categories={categories} tasks={pendingTasks} setUncompletedTasks={setPendingTasks} setCompletedTasks={setCompletedTasks} setUser={setUser} />
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-gray-900/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Tareas Completadas</h2>
                <TaskList stats={stats} categories={categories} tasks={completedTasks} setUncompletedTasks={setPendingTasks} setCompletedTasks={setCompletedTasks} setUser={setUser} />
              </div>
            </div>
          </div>
        </main>
        {/* Panel de creación de tareas */}
        {isTaskFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96 relative">
              {/* Botón para cerrar el panel */}
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
                onClick={() => setIsTaskFormOpen(false)}
                aria-label="Cerrar"
              >
                &times;
              </button>
              <h2 className="text-lg font-semibold mb-4">Crear Nueva Tarea</h2>
              <TaskForm userId={user?.id} stats={stats} setTasks={setPendingTasks} tasks={[...pendingTasks, ...completedTasks]} />
            </div>
          </div>
        )}
        {editTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96 relative">
              {/* Botón para cerrar el panel */}
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
                onClick={() => setEditTask(null)}
                aria-label="Cerrar"
              >
                &times;
              </button>
              <h2 className="text-lg font-semibold mb-4">Editar Tarea</h2>
              <EditTaskForm userId={user?.id} stats={stats} onEditTask={(updatedTask) => {
                setPendingTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
                setCompletedTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
              }} originalTask={editTask} onCancel={() => setEditTask(null)} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
