"use client"

import type React from "react"

import TaskGeneratorModal from "@/components/task-generator-modal"
import { PinInput } from "@/components/ui/pin-input"
import { API_URLS, fetcherWithCache, poster } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import { TaskGenerationResponse, TaskSuggestion } from "@/lib/ai-client"
import { Task, type Stat } from "@/types"
import { Pen, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface TaskFormProps {
  userId?: string
  stats?: Stat[]
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[]
}

export default function TaskForm({ userId, stats,setTasks,tasks }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [xpReward, setXpReward] = useState(10)
  const [statId, setStatId] = useState<number | null>(null)
  const [deadline, setDeadline] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [showPinVerify, setShowPinVerify] = useState(false)
  const [pin, setPin] = useState("")
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const router = useRouter()
  const [open, setOpen] = useState(false);


  // Agrupar stats por categoría para el select
  const [statsByCategory, setStatsByCategory] = useState<{ [key: string]: Stat[] }>({})
  useEffect(() => {
    if (stats) {
      const groupedStats: { [key: string]: Stat[] } = stats.reduce(
        (acc, stat) => {
          if (!stat.category) return acc
    
          if (!acc[stat.category.name]) {
            acc[stat.category.name] = []
          }
    
          acc[stat.category.name].push(stat)
          return acc
        },
        {} as Record<string, Stat[]>,
      )
      setStatsByCategory(groupedStats)
    }
  }
  , [stats])

  useEffect(() => {
    const fetchPin = async () => {
      const data = await fetcherWithCache(API_URLS.NIP.HAS)
      if (data.success && data.result) {
        setShowPinVerify(true)
      } else {
        setShowPinSetup(true)
      }
    }

    fetchPin()
  }
  , [])

  const handlePinSetup = async () => {
    if (pin.length === 4) {
      const data = await poster(API_URLS.NIP.CREATE, { objectbody: {pin} }) 
      if (!data.success) {
        setError("Error al guardar el PIN")
        return
      }
      setError("")
      setShowPinSetup(false)
      apiCache.override<boolean>(API_URLS.NIP.HAS, () => true)
    } else {
      setError("El PIN debe tener 4 dígitos")
    }
  }

  const handlePinVerify = async () => {
    if (pin.length === 4) {
      const data = await poster(API_URLS.NIP.VALIDATE, { objectbody: {pin} }) 
      if (data.success) {
        setShowPinVerify(false)
      } else {
        setError("PIN incorrecto")
      }
    } else {
      setError("El PIN debe tener 4 dígitos")
    }
  }

  const editTaskWithAI = async () => {
    //title, description, xpReward, stat,stats, deadline, lastTasks
    if (!title || !description || !xpReward ) {
      setError("Por favor, completa todos los campos requeridos")
      return
    }
    setIsLoadingAi(true) 

    const data = await poster(API_URLS.AI.SUGGEST, {
      objectbody: {
        title,
        description,
        xpReward,
        stat: stats?.find((stat) => stat.id === statId || 0) ,
        stats,
        deadline,
        lastTasks: tasks
      }
    })
    if (data.success) {
      const res = data.result as TaskSuggestion
      setXpReward(res?.suggested_xp!)
      setStatId(res?.suggested_stat ? Number.parseInt(res.suggested_stat) : null)
      if (res?.suggested_description) {
        setDescription(res.suggested_description)
      }
      if (res?.suggested_title) {
        setTitle(res.suggested_title)
      }
    } else {
      setError("Error al obtener la sugerencia")
    }
    setIsLoadingAi(false)
  }


  const submitTask = async () => {
    setIsLoading(true)
    setError("")

    if (!title || !xpReward || !pin) {
      setError("Por favor, completa todos los campos requeridos")
      setIsLoading(false)
      return
    }

    const formData = {
      userId,
      title,
      description,
      xpReward,
      statId,
      deadline,
      pin
    }
    //check if the deadline is in the future
    if (deadline && new Date(deadline).getTime() < new Date().getTime()) {
      setError("La fecha de entrega no puede ser en el pasado")
      setIsLoading(false)
      return
    }
    try {
      const data = await poster(API_URLS.TASK.CREATE, {objectbody:formData})

      if (data.success) {
        setTitle("")
        setDescription("")
        setXpReward(10)
        setStatId(null)
        setDeadline("")
          apiCache.override<Task[]>(API_URLS.USER.TASKS_UNCOMPLETED, (prev) => {
            return [...prev, data.result]
          }
          
        )
        if(setTasks) {
          console.log("setTasks",data.result)
          setTasks(prev => [...prev, data.result])
        }
        router.refresh()
      } else {
        setError(data.message || "Error al crear la tarea")
      }
    } catch (error) {
      console.log(error)
      setError("Error al crear la tarea")
    } finally {
      setIsLoading(false)
    }
  }


  const uploadTasks = async (ctasks: TaskGenerationResponse[]) => {
    let filledTasks = []
    for (const task of ctasks) {
      try {
        //verify deadline
        if (task.deadline) {
          const deadlineDate = new Date(task.deadline)
          if (deadlineDate.getTime() < Date.now()) {
            setError("La fecha límite no puede ser en el pasado")
            return
          }
        }
        const resp  = await poster(API_URLS.TASK.CREATE, {
          objectbody: {
            title: task.title,
            description: task.description,
            xpReward: task.xp_reward,
            stat: task.stat_id,
            deadline: task.deadline,
            pin
          },
        });
        if (resp.success) {
          filledTasks.push(resp.result)
        } else {
          setError(resp.message || "Error al subir la tarea")
        }
      } catch (error) {
        console.error('Error subiendo tarea', error);
      }
    }
    apiCache.override<Task[]>(API_URLS.USER.TASKS_UNCOMPLETED, (prev) => {
      return [...prev, ...filledTasks]
    })
    if(setTasks) {
      setTasks(prev => [...prev, ...filledTasks])
    }
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (showPinSetup) {
      handlePinSetup()
    } else if(pin === "") {
      setShowPinVerify(true)
    } else {
      submitTask()
    }
  }

  if (showPinSetup) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 text-sm text-white">
          Para proteger la creación de tareas, establece un PIN de 4 dígitos que se te pedirá cada vez que quieras crear
          una tarea.
        </div>

        {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}

        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-4">Establece tu PIN de 4 dígitos</h3>
          <div className="flex justify-center mb-6">
            <PinInput length={4} value={pin} onChange={setPin} />
          </div>
          <button onClick={handlePinSetup} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white">
            Guardar PIN
          </button>
        </div>
      </div>
    )
  }

  if (showPinVerify) {
    return (
      <div className="space-y-6">
        {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}

        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-4">Ingresa tu PIN para crear la tarea</h3>
          <div className="flex justify-center mb-6">
            <PinInput length={4} value={pin} onChange={setPin} />
          </div>
          <button onClick={handlePinVerify} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white">
            Verificar PIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">
          Título
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Nombre de la tarea"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Descripción de la tarea"
          rows={3}
          required
        />
      </div>

      <div>
        <label htmlFor="xpReward" className="block text-sm font-medium text-gray-400 mb-1">
          Recompensa de XP
        </label>
        <input
          id="xpReward"
          type="number"
          min="1"
          max="100"
          value={xpReward}
          onChange={(e) => setXpReward(Number.parseInt(e.target.value))}
          className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        
          required/>
      </div>

      <div>
  <label htmlFor="statId" className="block text-sm font-medium text-gray-400 mb-1">
    Stat asociado
  </label>
  {!stats ? (
    <div className="w-full h-10 bg-gray-800 rounded-md animate-pulse" />
  ) : (
    <select
      id="statId"
      value={statId || ""}
      onChange={(e) => setStatId(e.target.value ? Number.parseInt(e.target.value) : null)}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
    
      required>
      <option value="">Ninguno</option>
      {Object.entries(statsByCategory).map(([category, stats]) => (
        <optgroup key={category} label={category}>
          {stats.map((stat) => (
            <option key={stat.id} value={stat.id}>
              {stat.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )}
</div>


      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-400 mb-1">
          Fecha límite 
        </label>
        <input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
       
          required />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? "Creando..." : "Crear Tarea"}
        </button>
      </div>
      <div>
        <button
          type="button"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          onClick={editTaskWithAI}
          disabled={isLoadingAi}
          >
            <Sparkles className="mr-2" />
          </button>


      </div>
      <div>
        <button
          type="button"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          onClick={() => setOpen(true)}
          disabled={open}
          >
            <Pen className="mr-2" />
          </button>
      </div>
        <TaskGeneratorModal
          open={open}
          setOpen={setOpen}
          stats={stats || []}
          uploadTasks={uploadTasks}
          statsByCategory={statsByCategory}

        ></TaskGeneratorModal>
    </form>
  )
}
