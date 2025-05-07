"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Flame } from "lucide-react"

interface StreakCounterProps {
  streak: number
  className?: string
}

export function StreakCounter({ streak, className = "" }: StreakCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Animar al montar el componente
    setIsAnimating(true)

    // Desactivar la animación después de un tiempo
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`flex items-center ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isAnimating ? [1, 1.2, 1] : 1,
          opacity: 1,
          rotate: isAnimating ? [0, -10, 10, -10, 0] : 0,
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.2, 0.5, 0.8, 1],
          ease: "easeInOut",
        }}
        className="relative"
      >
        <Flame className="w-8 h-8 text-orange-500" />
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
        >
          {streak}
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="ml-2 text-sm font-medium"
      >
        <span className="text-orange-500">{streak} días</span> de racha
      </motion.div>
    </div>
  )
}
