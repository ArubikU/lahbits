"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface PinInputProps {
  length: number
  value: string
  onChange: (value: string) => void
}

export function PinInput({ length, value, onChange }: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Sincronizar el valor externo con el estado interno
  useEffect(() => {
    const valueArray = value.split("").slice(0, length)
    const newValues = [...valueArray, ...Array(length - valueArray.length).fill("")]
    setValues(newValues)
  }, [value, length])

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 1)

    if (newValue || newValue === "") {
      const newValues = [...values]
      newValues[index] = newValue
      setValues(newValues)

      // Actualizar el valor externo
      onChange(newValues.join(""))

      // Mover al siguiente input si hay un valor
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Mover al input anterior al presionar backspace en un input vacío
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Mover al input anterior al presionar la flecha izquierda
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Mover al siguiente input al presionar la flecha derecha
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData("text/plain")
      .replace(/[^0-9]/g, "")
      .slice(0, length)

    if (pastedData) {
      const newValues = [...Array(length).fill("")]

      for (let i = 0; i < pastedData.length; i++) {
        newValues[i] = pastedData[i]
      }

      setValues(newValues)
      onChange(newValues.join(""))

      // Mover al último input con valor
      const lastIndex = Math.min(pastedData.length - 1, length - 1)
      inputRefs.current[lastIndex]?.focus()
    }
  }

  return (
    <div className="flex space-x-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={values[index]}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl font-bold bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      ))}
    </div>
  )
}
