"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";

export default function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  useEffect(() => {
    const stage = searchParams.get("stage");
    if (stage === "register") setIsLogin(false);
    else if (stage === "login") setIsLogin(true);
  }, [searchParams]);

  const handleSwitch = (login: boolean) => {
    setIsLogin(login);
    router.replace(`auth?stage=${login ? "login" : "register"}`);
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="w-full max-w-4xl flex flex-col md:flex-row bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Lado izquierdo - Imagen/Branding */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-green-900 to-blue-900 p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Lahbits
              </h1>
              <p className="text-gray-300 mt-2">Gamifica tu productividad</p>
            </div>

            <div className="relative z-10 mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                {isLogin ? "¡Bienvenido de nuevo!" : "¡Únete a la aventura!"}
              </h2>
              <p className="text-gray-300">
                {isLogin
                  ? "Inicia sesión para continuar tu progreso y completar tus tareas diarias."
                  : "Crea una cuenta y comienza a gamificar tu productividad de forma divertida y efectiva."}
              </p>
            </div>

            {!isMobile && (<div className="relative z-10 mt-8">
              <Image
                src="/images/lahbits-auth.svg"
                alt="Lahbits Illustration"
                width={300}
                height={200}
                className="mx-auto"
              />
            </div>)}
          </div>

          {/* Lado derecho - Formularios */}
<div className="w-full md:w-1/2 p-8">
  <div className="flex justify-center mb-8">
    <div className="bg-gray-700 p-1 rounded-lg flex">
      <button
        onClick={() => handleSwitch(true)}
        className={`px-4 py-2 rounded-md transition-all ${
          isLogin ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        Iniciar sesión
      </button>
      <button
        onClick={() => handleSwitch(false)}
        className={`px-4 py-2 rounded-md transition-all ${
          !isLogin ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        Registrarse
      </button>
    </div>
  </div>

  <AnimatePresence mode="wait">
    <motion.div
      key={isLogin ? "login" : "register"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {isLogin ? <LoginForm /> : <RegisterForm onSuccess={() => handleSwitch(true)} />}
    </motion.div>
  </AnimatePresence>
</div>
        </div>
      </div>
  );
}
