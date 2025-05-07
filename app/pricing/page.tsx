import { Check } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Precios - Lahbits",
  description: "Planes y precios para implementar Lahbits en tu empresa y mejorar la productividad de tu equipo.",
}

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "Gratis",
      description: "Para uso personal",
      features: [
        "Hasta 5 usuarios",
        "Gamificación básica",
        "Estadísticas personalizadas",
        "Sistema de rachas",
        "Marketplace personal",
      ],
      cta: "Comenzar gratis",
      href: "/register",
      popular: false,
    },
    {
      name: "Team",
      price: "9€",
      period: "por usuario / mes",
      description: "Para equipos pequeños",
      features: [
        "Hasta 20 usuarios",
        "Todas las características de Starter",
        "Panel de administración",
        "Estadísticas de equipo",
        "Desafíos grupales",
        "Integraciones con herramientas de productividad",
        "Soporte por email",
      ],
      cta: "Prueba gratuita de 14 días",
      href: "/contact?plan=team",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      description: "Para grandes organizaciones",
      features: [
        "Usuarios ilimitados",
        "Todas las características de Team",
        "Implementación personalizada",
        "Integración con sistemas existentes",
        "Personalización de marca",
        "Análisis avanzados",
        "Soporte prioritario 24/7",
        "Gestor de cuenta dedicado",
      ],
      cta: "Contactar con ventas",
      href: "/contact?plan=enterprise",
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Lahbits
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/features" className="px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white">
                Características
              </Link>
              <Link href="/pricing" className="px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white">
                Precios
              </Link>
              <Link href="/auth?stage=login" className="px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white">
                Iniciar sesión
              </Link>
              <Link href="/register" className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold mb-4 text-white">Planes y precios</h1>
            <p className="text-xl text-gray-300">
              Elige el plan que mejor se adapte a las necesidades de tu equipo y mejora su productividad con
              gamificación.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-gray-800 rounded-xl overflow-hidden border ${
                  plan.popular ? "border-green-500" : "border-gray-700"
                }`}
              >
                {plan.popular && (
                  <div className="bg-green-600 py-1 px-4 text-center">
                    <span className="text-sm font-medium text-white">Más popular</span>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-2">{plan.name}</h2>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-400 ml-2">{plan.period}</span>}
                  </div>
                  <p className="text-gray-400 mb-6">{plan.description}</p>

                  <Link
                    href={plan.href}
                    className={`block w-full py-2 px-4 rounded-md text-center font-medium ${
                      plan.popular
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>

                <div className="px-6 pb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">Lo que incluye:</h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">¿Necesitas una solución personalizada?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Contacta con nuestro equipo de ventas para obtener más información sobre cómo Lahbits puede adaptarse a
              las necesidades específicas de tu organización.
            </p>
            <Link
              href="/contact"
              className="inline-block py-3 px-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Contactar con ventas
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
