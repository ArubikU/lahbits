"use client"

import type React from "react"

import { API_URLS, former, poster } from "@/hooks/use-api"
import { apiCache } from "@/hooks/use-cache"
import type { User } from "@/types"
import Image from "next/image"
import { useState } from "react"

interface ProfileFormProps {
  user: User
    setUser?: React.Dispatch<React.SetStateAction<User | undefined>>;
}

const themes = [
  { id: 1, name: "Light", color: "#ffffff" },
  { id: 2, name: "Dark", color: "#121212" },
  { id: 3, name: "Dark Green", color: "#10b981" },
  { id: 4, name: "Dark Purple", color: "#8b5cf6" },
  { id: 5, name: "Dark Red", color: "#ef4444" },
]

export default function ProfileForm({ user , setUser}: ProfileFormProps) {
  const [nickname, setNickname] = useState(user.nickname || "")
  const [fullName, setFullName] = useState(user.full_name || "")
  const [themeId, setThemeId] = useState(user.theme_id)
  const [profileImage, setProfileImage] = useState<String | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [birthDate, setBirthDate] = useState(user.birth_date ? new Date(user.birth_date).toISOString().split("T")[0] : "")
  const [gender, setGender] = useState(user.gender || "")
  const [isStudent, setIsStudent] = useState(user.is_student || false)
  const [isWorking, setIsWorking] = useState(user.is_working || false)
  const [isEmailNotifications, setIsEmailNotifications] = useState(user.is_email_notifications || false)
  const [customGender, setCustomGender] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          if(reader.result){
            
            const blob = new Blob([reader.result], { type: file.type });

            const formData = new FormData();
            formData.append("file", blob, file.name);
            formData.append("userId", user.id.toString());
            console.log(formData)
            former(API_URLS.IMAGE, {
              body:  formData,
            }).then((result) => {
              if (result.success) {
                setProfileImage(result.url);
                console.log("Imagen subida:", result.url);
                setError("");
              } else {
                setError(result.message || "Error al subir la imagen");
              }
            }
            ).catch((error) => {
              console.error("Error al subir la imagen:", error);
              setError("Error al subir la imagen");
            }
            );
          }
        };

      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await poster(API_URLS.USER.UPDATE,{
        objectbody: {
          userId: user.id.toString(),
        nickname,
        fullName,
        themeId: themeId.toString(),
        birthDate,
        gender: gender === "other" ? customGender : gender,
        isStudent,
        isWorking,
        profileImage,
        isEmailNotifications,
        }
      })

      if (result.success) {
        if(setUser){
          console.log("User updated:", result.result)

          setUser((prevUser) => ({
            ...prevUser,
            ...result.result as User
          }))
        }
        apiCache.override<User>(API_URLS.USER.GET, (prevUser) => ({
          ...prevUser,
          ...result.result as User
        }))
      } else {
        setError(result.message || "Error al actualizar el perfil")
      }
    } catch (error) {
      setError("Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">{error}</div>}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-3">
              {previewUrl || user.profile_image_url ? (
                <Image
                  src={previewUrl || user.profile_image_url || ""}
                  alt={user.nickname || user.username}
                  fill
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-4xl">
                  {user.nickname?.[0] || user.username[0]}
                </div>
              )}
            </div>

            <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md text-sm">
              Cambiar imagen
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        <div className="md:w-2/3 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Correo
            </label>
            <input
              id="email"
              value={user.username}
              disabled
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">El correo no se puede cambiar</p>
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-400 mb-1">
              Nickname
            </label>
            <input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-400 mb-1">
              Nombre completo
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-400 mb-1">
    Fecha de nacimiento
  </label>
  <input
    type="date"
    id="birthDate"
    value={birthDate}
    onChange={(e) => setBirthDate(e.target.value)}
    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
  />
</div>

<div>
  <label htmlFor="gender" className="block text-sm font-medium text-gray-400 mb-1">
    Género
  </label>
  <select
    id="gender"
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
  >
    <option value="">No especificado</option>
    <option value="female">Femenino</option>
    <option value="male">Masculino</option>
    <option value="non-binary">No binario</option>
    <option value="other">Otro</option>
  </select>

  {gender === "other" && (
    <input
      type="text"
      placeholder="Especifica tu género"
      value={customGender}
      onChange={(e) => setCustomGender(e.target.value)}
      className="mt-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
    />
  )}
</div>


<div className="flex items-center space-x-4">
  <label className="flex items-center text-gray-400">
    <input
      type="checkbox"
      checked={isStudent}
      onChange={(e) => setIsStudent(e.target.checked)}
      className="mr-2"
    />
    Soy estudiante
  </label>
  <label className="flex items-center text-gray-400">
    <input
      type="checkbox"
      checked={isWorking}
      onChange={(e) => setIsWorking(e.target.checked)}
      className="mr-2"
    />
    Estoy trabajando
  </label>
  <label className="flex items-center text-gray-400">
    <input
      type="checkbox"
      checked={isEmailNotifications}
      onChange={(e) => setIsEmailNotifications(e.target.checked)}
      className="mr-2"
    />
    Recibir notificaciones
  </label>
</div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-400 mb-1">
              Tema
            </label>
            <div className="grid grid-cols-5 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeId(theme.id)}
                  className={`w-full h-10 rounded-md border-2 ${
                    themeId === theme.id ? "border-green-500" : "border-transparent"
                  }`}
                  style={{ backgroundColor: theme.color }}
                  title={theme.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  )
}
