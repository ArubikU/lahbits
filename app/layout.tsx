import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Lahbits - Gamifica tu productividad",
    template: "%s | Lahbits",
  },
  description:
    "Convierte tus tareas diarias en una aventura. Gana XP, sube de nivel y mejora tus estadísticas mientras cumples tus objetivos.",
  keywords: ["productividad", "gamificación", "hábitos", "tareas", "RPG", "estadísticas", "racha"],
  authors: [{ name: "Lahbits Team" }],
  creator: "Lahbits",
  publisher: "Lahbits",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://lahbits.vercel.app",
    siteName: "Lahbits",
    title: "Lahbits - Gamifica tu productividad",
    description:
      "Convierte tus tareas diarias en una aventura. Gana XP, sube de nivel y mejora tus estadísticas mientras cumples tus objetivos.",
    images: [
      {
        url: "/images/lahbits-og.png",
        width: 1200,
        height: 630,
        alt: "Lahbits - Gamifica tu productividad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lahbits - Gamifica tu productividad",
    description:
      "Convierte tus tareas diarias en una aventura. Gana XP, sube de nivel y mejora tus estadísticas mientras cumples tus objetivos.",
    images: ["/images/lahbits-og.png"],
    creator: "@lahbits",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-900 text-white`}>{children}</body>
    </html>
  )
}


import './globals.css'
