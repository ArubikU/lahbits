"use client"

import { useMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface LandingHeaderProps {
  authenticated?: boolean
}

export function LandingHeader({ authenticated }: LandingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMobile()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              Lahbits
            </span>
          </Link>

          {isMobile ? (
            <>
              <button onClick={toggleMenu} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-800"
                >
                  <div className="py-4 px-4 space-y-4">
                    <Link
                      href="/features"
                      className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={toggleMenu}
                    >
                      Características
                    </Link>
                    <Link
                      href="/pricing"
                      className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={toggleMenu}
                    >
                      Precios
                    </Link>
                    <Link
                      href={authenticated ? "/dashboard" : "/auth"}
                      className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={toggleMenu}
                    >
                      {authenticated ? "Panel" : "Iniciar sesión"}
                    </Link>
                    <Link
                      href="/auth?stage=register"
                      className="block px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
                      onClick={toggleMenu}
                    >
                      Registrarse
                    </Link>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/features" className="px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white">
                Características
              </Link>
              <Link href="/pricing" className="px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white">
                Precios
              </Link>
              <Link href= {authenticated ? "/dashboard" : "/auth"}
              
              className="px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white">
                {authenticated ? "Panel" : "Iniciar sesión"}
              </Link>
              <Link href="/auth?stage=register" className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
