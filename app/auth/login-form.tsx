"use client"

import type React from "react"

import { GoogleLoginButton } from "@/components/ui/google-login-button"
import { API_URLS, poster } from "@/hooks/use-api"
import { setupAuth } from "@/lib/auth"
import { motion } from "framer-motion"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [remember,setRemeber] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError("")

    try {
      let data = await poster(API_URLS.AUTH.LOGIN, {
        objectbody: { username, password, remember }
      })  


      if (data.success) {
        setupAuth(data)
        router.push("/dashboard")
      } else {
        setError(data.message || "Error al iniciar sesión")
      }
    } catch (error) {
      console.log("error",error)
      setError("Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white"
        >
          {error}
        </motion.div>
      )}
      
      <GoogleLoginButton className="mb-4" />

      <div className="relative flex items-center justify-center">
        <div className="flex-1 border-t border-gray-600"></div>
        <span className="mx-4 text-sm text-gray-400">o</span>
        <div className="flex-1 border-t border-gray-600"></div>
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
          Nombre de usuario
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            onClick={(e) => setRemeber(e.currentTarget.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
            Recordarme
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-green-500 hover:text-green-400">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <LogIn className="w-5 h-5 mr-2" />
          )}
          Iniciar sesión
        </button>
      </div>
    </form>
  )
}
