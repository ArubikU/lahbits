"use client"
import { BenefitCard } from "@/components/benefit-card"
import { LandingFooter } from "@/components/landing-footer"
import { LandingHeader } from "@/components/landing-header"
import { verifyAuth } from "@/lib/auth"
import { Award, BarChart4, Brain, Flame, ShoppingBag, TrendingUp, Zap } from "lucide-react"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {

    const auth = verifyAuth()
  const benefits = [
    {
      icon: <Brain className="w-6 h-6 text-green-500" />,
      title: "Gamificación",
      description: "Convierte tus tareas diarias en una aventura. Gana XP, sube de nivel y mejora tus estadísticas.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      title: "Seguimiento de progreso",
      description: "Visualiza tu crecimiento en diferentes áreas con gráficos intuitivos y estadísticas detalladas.",
    },
    {
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      title: "Sistema de rachas",
      description: "Mantén la consistencia y recibe bonificaciones por completar tareas varios días seguidos.",
    },
    {
      icon: <Award className="w-6 h-6 text-yellow-500" />,
      title: "Niveles y prestigio",
      description: "Sube de nivel, desbloquea prestigio y demuestra tu dedicación a largo plazo.",
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      title: "Motivación constante",
      description: "Mantente motivado con recompensas inmediatas y visualización de tu progreso.",
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-pink-500" />,
      title: "Marketplace personalizado",
      description: "Crea y compra recompensas personalizadas con el oro que ganas completando tareas.",
    },
  ]

  return (
    <>
      <Head>

        <title>Lahbits - Gamifica tu productividad</title>
        <meta
          name="description"
          content="Convierte tus tareas diarias en una aventura. Gana XP, sube de nivel y mejora tus estadísticas mientras cumples tus objetivos."
        />
        <meta name="keywords" content="productividad, gamificación, hábitos, tareas, RPG, estadísticas, racha" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Lahbits - Gamifica tu productividad" />
        <meta
          property="og:description"
          content="Convierte tus tareas diarias en una aventura. Gana XP, sube de nivel y mejora tus estadísticas mientras cumples tus objetivos."
        />
        <meta property="og:image" content="/images/lahbits-og.svg" />
        <meta property="og:url" content="https://lahbits.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Lahbits" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Lahbits - Gamifica tu productividad" />


      </Head>
        <div className="min-h-screen bg-gray-900 text-white">
      <LandingHeader authenticated={auth} />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                  Gamifica tu productividad
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Convierte tus tareas diarias en una aventura. Gana XP, sube de nivel y mejora tus estadísticas
                  mientras cumples tus objetivos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth?stage=register"
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors text-center"
                  >
                    Comenzar ahora
                  </Link>
                  <Link
                    href={auth ? "/dashboard" : "/auth?stage=login"}
                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors text-center"
                  >
                    {auth ? "Ir al panel" : "Iniciar sesión"}
                  </Link>
                </div>
              </div>

              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-75"></div>
                  <div className="relative bg-gray-800 rounded-2xl overflow-hidden">
                    <Image
                      src="/images/dashboard-preview.svg"
                      alt="Lahbits Dashboard Preview"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gray-950">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              ¿Por qué usar <span className="text-green-500">Lahbits</span>?
            </h2>
            <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">
              Lahbits combina la ciencia de la gamificación con herramientas de productividad para ayudarte a alcanzar
              tus metas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Características principales</h2>

            <div className="space-y-24">
              {/* Feature 1 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                  <div className="inline-block mb-3 text-green-500">
                    <BarChart4 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Estadísticas personalizadas</h3>
                  <p className="text-gray-400 mb-6">
                    Crea y personaliza tus propias estadísticas en diferentes categorías. Observa cómo mejoran a medida
                    que completas tareas relacionadas.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-gray-300">Categorías ilimitadas</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-gray-300">Visualización en gráfico radar</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-gray-300">Progreso visual con barras de progreso</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-75"></div>
                    <div className="relative bg-gray-800 rounded-2xl overflow-hidden p-6">
                      <Image
                        src="/images/stats-preview.svg"
                        alt="Estadísticas personalizadas"
                        width={500}
                        height={300}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center">
                <div className="md:w-1/2 mb-10 md:mb-0 md:pl-10">
                  <div className="inline-block mb-3 text-orange-500">
                    <Flame className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Sistema de rachas</h3>
                  <p className="text-gray-400 mb-6">
                    Mantén la consistencia y recibe bonificaciones por completar tareas varios días seguidos. Cuanto más
                    larga sea tu racha, mayores serán tus recompensas.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      </div>
                      <span className="text-gray-300">Bonificaciones de XP personalizables</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      </div>
                      <span className="text-gray-300">Recuperación de rachas perdidas</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      </div>
                      <span className="text-gray-300">Seguimiento de racha máxima</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-75"></div>
                    <div className="relative bg-gray-800 rounded-2xl overflow-hidden p-6">
                      <Image
                        src="/images/streak-preview.svg"
                        alt="Sistema de rachas"
                        width={500}
                        height={300}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                  <div className="inline-block mb-3 text-pink-500">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Marketplace personalizado</h3>
                  <p className="text-gray-400 mb-6">
                    Crea y compra recompensas personalizadas con el oro que ganas completando tareas. Establece tus
                    propias reglas y motivaciones.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center mr-3">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      </div>
                      <span className="text-gray-300">Recompensas personalizadas</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center mr-3">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      </div>
                      <span className="text-gray-300">Límites de compra configurables</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center mr-3">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      </div>
                      <span className="text-gray-300">Historial de compras</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-75"></div>
                    <div className="relative bg-gray-800 rounded-2xl overflow-hidden p-6">
                      <Image
                        src="/images/marketplace-preview.svg"
                        alt="Marketplace personalizado"
                        width={500}
                        height={300}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-900/50 to-blue-900/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para gamificar tu productividad?</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Únete a Lahbits hoy y transforma la manera en que cumples tus objetivos. Es gratis, divertido y efectivo.
            </p>
            <Link
              href="/auth?stage=register"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors inline-block text-lg"
            >
              Comenzar ahora
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
    </>
  )
}
