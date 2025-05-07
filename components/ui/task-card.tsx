"use client"

import type { Task } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle, Clock, Coins, Star } from "lucide-react"

interface TaskCardProps {
  task: Task
  onComplete?: (taskId: number) => void
  onDelete?: (taskId: number) => void
  onStar?: (taskId: number) => void
  onUnstar?: (taskId: number) => void
}

export function TaskCard({ task, onComplete,onStar,onUnstar,onDelete }: TaskCardProps) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date()
  const starComponentLogic = () => {
    //task can have favorite or not and if it has favorite it can be starred or not
    //onStar and onUnstar are functions that can be passed to the component 
    if(task.is_completed) return
    if (task.favorite) {
      return task.favorite ? (
      <button
        onClick={() => onUnstar && onUnstar(task.id)}
        className="p-1 rounded-full hover:bg-yellow-500/20 transition-colors"
      >
        <Star className="w-5 h-5 text-yellow-500" />
      </button>
      ) : (
      <button
        onClick={() => onStar && onStar(task.id)}
        className="p-1 rounded-full hover:bg-gray-500/20 transition-colors"
      >
        <Star className="w-5 h-5 text-gray-500" />
      </button>
      );
    } else {
      return (
      <button
        onClick={() => onStar && onStar(task.id)}
        className="p-1 rounded-full hover:bg-gray-500/20 transition-colors"
      >
        <Star className="w-5 h-5 text-gray-500" />
      </button>
      );
    }

  }
  return (
    <div className={`p-3 rounded-lg mb-2 ${isOverdue ? "bg-red-900/20 border border-red-800" : "bg-gray-800/50"}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-white">{task.title}</h3>
          {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
          {task.stat && (
            <div className="flex items-center mt-1">
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: task.stat.category?.color || "#10b981" }}
              />
              <span className="text-xs text-gray-400">{task.stat.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-3">
            <Coins className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm text-yellow-500">{task.xp_reward}</span>
          </div>
          {onComplete && <button
            onClick={() => onComplete(task.id)}
            className="p-1 rounded-full hover:bg-green-500/20 transition-colors"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
          </button>}
          {onDelete && !task.is_completed && <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>}
          {starComponentLogic()}


        </div>
      </div>
      {task.deadline && (
        <div className="flex items-center mt-2 text-xs text-gray-400">
          <Clock className="w-3 h-3 mr-1" />
          <span className={isOverdue ? "text-red-400" : ""}>
            {formatDistanceToNow(new Date(task.deadline), { addSuffix: true, locale: es })}
          </span>
        </div>
      )}
    </div>
  )
}
