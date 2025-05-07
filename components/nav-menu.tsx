"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CheckSquare, User, Star, ShoppingBag, Building, Briefcase } from "lucide-react"

export function NavMenu() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/tasks", label: "Tareas", icon: CheckSquare },
    { href: "/streak", label: "Racha", icon: Star },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/profile", label: "Perfil", icon: User },
  ]

  return (
    <nav className="mt-6">
      <ul className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-green-600/20 text-green-500" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{link.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
