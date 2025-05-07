"use client"

import { API_URLS, deleter, patcher } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import type { Stat, StatCategory, Task, User } from "@/types"
import { TaskCard } from "./ui/task-card"


interface TaskListProps {
  tasks: Task[]
  stats?: Stat[]
  categories?: StatCategory[]
  setUncompletedTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setCompletedTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setUser?: React.Dispatch<React.SetStateAction<User | undefined>>;

  setEditTask?: React.Dispatch<React.SetStateAction<Task | null>>;
}

export function TaskList({ tasks, setUncompletedTasks, setCompletedTasks, setUser, categories, stats,setEditTask }: TaskListProps) {
  const handleCompleteTask = async (taskId: number) => {
    try {
      const taskToComplete = tasks.find((task) => task.id === taskId)

      if (!taskToComplete) {
        console.warn("Tarea no encontrada.")
        return
      }

      if (taskToComplete.is_completed) {
        console.warn("La tarea ya está completada.")
        return
      }

      const result = await patcher(API_URLS.USER.TASKS, {
        objectbody: { taskId, completed: true }
      }
      )

      if (result.success) {



        if (setUncompletedTasks) {
          setUncompletedTasks(tasks.filter((task) => task.id !== taskId))
        }
        if (setCompletedTasks) {
          const parser = ((prev: Task[]) => [...prev, { ...taskToComplete, is_completed: true }].sort((a, b) => {
            if (a.deadline && b.deadline) {
              return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            }
            return 0
          }))

          setCompletedTasks((tasks) => parser(tasks))
        }
        apiCache.override<Task[]>(
          API_URLS.USER.TASKS_UNCOMPLETED,
          (prev) => prev.filter((task) => task.id !== taskId)
        )
        apiCache.override<Task[]>(
          API_URLS.USER.TASKS_COMPLETED,
          (prev) => [...prev, { ...taskToComplete, is_completed: true }]
        )

        if (setUser) {
          setUser((prev) => {
            if (prev) {
              return {
                ...prev, total_xp: result.result.new_xp, current_xp: result.result.new_xp
                , current_level: result.result.new_level
              }
            }
            return prev
          })
          apiCache.override<User>(
            API_URLS.USER.GET,
            (prev) => {
              if (prev) {
                return {
                  ...prev, xp: prev.total_xp + result.result.xp_reward, current_xp: prev.current_xp + result.result.xp_reward
                  , current_level: result.result.new_level
                }
              }
              return prev
            }
          )
        }
      }
    } catch (error) {
      console.error("Error completing task:", error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      const result = await deleter(API_URLS.TASK.DELETE, {
        objectbody: { taskId, completed: false }
      }
      )

      if (result.success) {
        if (setUncompletedTasks) {
          setUncompletedTasks(tasks.filter((task) => task.id !== taskId))
        }
        apiCache.override<Task[]>(
          API_URLS.USER.TASKS_UNCOMPLETED,
          (prev) => prev.filter((task) => task.id !== taskId)
        )
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleUnfavoriteTask = async (taskId: number) => {
    try {
      const result = await patcher(API_URLS.TASK.UNFAVORITE, {
        objectbody: { taskId }
      }
      )

      if (result.success) {
        let newTasks = tasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, favorite: false }
          }
          return task
        }
        )
        newTasks = newTasks.sort((a, b) => {
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          if (a.deadline && b.deadline) {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          }
          return 0
        })
        apiCache.override<Task[]>(
          API_URLS.USER.TASKS_UNCOMPLETED,
          (prev) => newTasks
        )
        if (setUncompletedTasks) {
          setUncompletedTasks(newTasks)
        }
      }
    } catch (error) {
      console.error("Error unfavoriting task:", error)
    }
  }
  const handleFavoriteTask = async (taskId: number) => {
    try {
      const result = await patcher(API_URLS.TASK.FAVORITE, {
        objectbody: { taskId }
      }
      )

      if (result.success) {
        let newTasks = tasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, favorite: true }
          }
          return task
        }
        )
        newTasks = newTasks.sort((a, b) => {
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          if (a.deadline && b.deadline) {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          }
          return 0
        })
        apiCache.override<Task[]>(
          API_URLS.USER.TASKS_UNCOMPLETED,
          (prev) => newTasks
        )
        if (setUncompletedTasks) {
          setUncompletedTasks(newTasks)
        }
      }
    } catch (error) {
      console.error("Error favoriting task:", error)
    }
  }

  // Helper function to get category color by task
  function getCategoryColor(task: Task): string | undefined {
    if (!categories || !task.stat_id || !stats) return undefined
    const stat = stats.find((stat) => stat.id === task.stat_id)
    const category = categories.find((category) => category.id === stat?.category_id)
    return category ? category.color : undefined
  }

  return (
    <div className="bg-gray-900/50 rounded-xl p-2">
      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No hay tareas</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="relative"
              style={
                getCategoryColor(task)
                  ? { borderLeft: `6px solid ${getCategoryColor(task)}` }
                  : undefined
              }
            >
              <TaskCard
                task={task}
                onComplete={!task.is_completed ? handleCompleteTask : undefined}
                onDelete={!task.is_completed ? handleDeleteTask : undefined}
                onStar={handleFavoriteTask}
                onUnstar={handleUnfavoriteTask}
                setEditTask={setEditTask}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
