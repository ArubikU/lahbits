"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

interface BenefitCardProps {
  icon: React.ReactNode
  title: string
  description: string
  index: number
}

export function BenefitCard({ icon, title, description, index }: BenefitCardProps) {
  const isMobile = useMobile()

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: 0.1 * index,
        duration: 0.5,
        ease: "easeOut",
      }}
      className={`bg-gray-800 rounded-xl p-6 ${isMobile ? "w-full" : ""}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.1 * index + 0.2,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mb-4"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}
