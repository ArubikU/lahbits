"use client"

import ColorPicker from "@/components/custom/color-picker"
import EmojiPicker from "@/components/custom/emoji-picker"
import { API_URLS, deleter, patcher } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import type { StatCategory } from "@/types"
import { Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

interface CategoryListProps {
  categories: StatCategory[]
  userId: string
  setCategories?: React.Dispatch<React.SetStateAction<StatCategory[]>>
}

export default function CategoryList({ categories, userId,setCategories }: CategoryListProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingStatCategory, setEditingStatCategory] = useState<StatCategory | null>(null)
  const router = useRouter()

  const handleEdit = (category: StatCategory) => {
    setEditingStatCategory(category)
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (updatedCategory: StatCategory) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await patcher(API_URLS.CATEGORIES.UPDATE, {
        objectbody: {
          categoryId: updatedCategory.id,
          ...updatedCategory,
        },
      })

      if (result.success) {
        apiCache.override<StatCategory[]>(API_URLS.USER.STATS_CATEGORIES, (prev) =>
          prev.map((category) => (category.id === updatedCategory.id ? { ...category, ...updatedCategory } : category))
        )
        if (setCategories) {
          setCategories((prev) => 
            prev.map((category) => (category.id === updatedCategory.id ? { ...category, ...updatedCategory } : category))
          )
        }
        setIsEditDialogOpen(false)
      } else {
        setError(result.message || "Error al actualizar la categoría")
      }
    } catch (error) {

      setError("Error al actualizar la categoría")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: number) => {
    if (
      !confirm("¿Estás seguro de que quieres eliminar esta categoría? Se eliminarán todas las estadísticas asociadas.")
    ) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await deleter(API_URLS.CATEGORIES.DELETE, {
        objectbody: {
          userId,
          categoryId,
        }})

      if (result.success) {
        apiCache.override<StatCategory[]>(API_URLS.USER.STATS_CATEGORIES, (prev) =>
          prev.filter((category) => category.id !== categoryId)
        )
        apiCache.invalidate(API_URLS.USER.STATS)
        if(setCategories){
          setCategories((prev) => prev.filter((category) => category.id !== categoryId))
        }
      } else {
        setError(result.message || "Error al eliminar la categoría")
      }
    } catch (error) {
      setError("Error al eliminar la categoría")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}

      {categories.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No hay categorías creadas</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center text-xl mr-3"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{category.name}</h3>
                    {category.description && <p className="text-sm text-gray-400">{category.description}</p>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-blue-600 text-white transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={isLoading}
                    className="p-2 rounded-full bg-gray-700 hover:bg-red-600 text-white transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditDialogOpen && editingStatCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium text-white mb-4">Editar Categoría</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditSubmit(editingStatCategory)
              }}
            >
                <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <input
                  type="text"
                  value={editingStatCategory.name}
                  onChange={(e) => setEditingStatCategory({ ...editingStatCategory, name: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  />
                  <EmojiPicker
                  value={editingStatCategory.icon || ""}
                  showPresets={false}
                  onChange={(e) => setEditingStatCategory({ ...editingStatCategory, icon: e })}
                  />
                </div>
                </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  value={editingStatCategory.description || ""}
                  onChange={(e) => setEditingStatCategory({ ...editingStatCategory, description: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Color</label>
                <div className="flex items-center">
                          <ColorPicker
                    value={editingStatCategory.color}
                    onChange={(e) => setEditingStatCategory({ ...editingStatCategory, color: e})}
                            showPresets={false}
                          />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
