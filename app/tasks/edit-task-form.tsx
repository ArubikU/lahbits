"use client"

import type React from "react"

import { PinInput } from "@/components/ui/pin-input"
import { API_URLS, fetcherWithCache, patcher, poster } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import { Task, type Stat } from "@/types"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface EditTaskFormProps {
    userId?: string
    stats?: Stat[]
    originalTask: Task
    onEditTask: (updatedTask: Task) => void
    onCancel?: () => void
}

export default function EditTaskForm({
    userId,
    stats,
    originalTask,
    onEditTask,
    onCancel,
}: EditTaskFormProps) {
    const [title, setTitle] = useState(originalTask.title)
    const [description, setDescription] = useState(originalTask.description)
    const [xpReward, setXpReward] = useState(originalTask.xp_reward)
    const [statId, setStatId] = useState<number | null>(originalTask.stat_id ?? null)
    const [deadline, setDeadline] = useState(
        originalTask.deadline
            ? new Date(originalTask.deadline).toISOString().slice(0, 16)
            : ""
    )
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPinVerify, setShowPinVerify] = useState(false)
    const [pin, setPin] = useState("")
    const router = useRouter()

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
    }, [stats])

    useEffect(() => {
        const fetchPin = async () => {
            const data = await fetcherWithCache(API_URLS.NIP.HAS)
            if (data.success && data.result) {
                setShowPinVerify(true)
            }
        }
        fetchPin()
    }, [])

    const handlePinVerify = async () => {
        if (pin.length === 4) {
            const data = await poster(API_URLS.NIP.VALIDATE, { objectbody: { pin } })
            if (data.success) {
                setShowPinVerify(false)
                handleEditTask()
            } else {
                setError("PIN incorrecto")
            }
        } else {
            setError("El PIN debe tener 4 dígitos")
        }
    }

    const handleEditTask = async () => {
        setIsLoading(true)
        setError("")

        if (!title || !xpReward || !pin) {
            setError("Por favor, completa todos los campos requeridos")
            setIsLoading(false)
            return
        }

        if (deadline && new Date(deadline).getTime() < new Date().getTime()) {
            setError("La fecha de entrega no puede ser en el pasado")
            setIsLoading(false)
            return
        }

        const formData = {
            userId,
            title,
            description,
            xp_reward: xpReward,
            stat_id: statId,
            deadline,
            pin,
            id: originalTask.id,
            taskId: originalTask.id,
        }

        try {
            const data = await patcher(API_URLS.TASK.UPDATE, { objectbody: formData })
            if (data.success) {
                apiCache.override<Task[]>(API_URLS.USER.TASKS_UNCOMPLETED, (prev) =>
                    prev.map((t) => (t.id === originalTask.id ? data.result : t))
                )
                onEditTask(data.result)
                router.refresh()
            } else {
                setError(data.message || "Error al editar la tarea")
            }
        } catch (error) {
            setError("Error al editar la tarea")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (showPinVerify) {
            handlePinVerify()
        } else {
            handleEditTask()
        }
    }

    if (showPinVerify) {
        return (
            <div className="space-y-6">
                {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}
                <div className="text-center">
                    <h3 className="text-lg font-medium text-white mb-4">Ingresa tu PIN para editar la tarea</h3>
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
                    required
                />
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
                        required
                    >
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
                    required
                />
            </div>

            <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-400 mb-1">
                    PIN
                </label>
                <div className="flex justify-start mb-2">
                    <PinInput length={4} value={pin} onChange={setPin} />
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-1 px-3 rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
                    title="Editar tarea"
                >
                    {isLoading ? "Guardando..." : "Guardar cambios"}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-2 py-1 px-3 rounded text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    )
}
