import { login } from "@/lib/api-auth";
import { createSession } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (per IP)
const attempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function isRateLimited(ip: string) {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry) return false
  if (now - entry.lastAttempt > WINDOW_MS) {
    attempts.delete(ip)
    return false
  }
  return entry.count >= MAX_ATTEMPTS
}

function recordAttempt(ip: string) {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now - entry.lastAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, lastAttempt: now })
  } else {
    entry.count += 1
    entry.lastAttempt = now
    attempts.set(ip, entry)
  }
}

export async function POST(request: NextRequest) {
  try {
    const ipv4 = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    if (isRateLimited(ipv4)) {
      return NextResponse.json(
        { success: false, message: "Demasiados intentos. Intenta de nuevo más tarde."
         },
        { status: 429 }
      )
    }

    const { username, password, remember } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    let result = await login(username, password)
    if (!result.success) {
      recordAttempt(ipv4)
      return NextResponse.json({ success: false, message: "Cuenta o contraseña invalida, "+(5-(attempts.get(ipv4)?.count || 0))+" intentos restantes" }, { status: 200 })
    }

    // Reset attempts on successful login
    attempts.delete(ipv4)

    const browser = request.headers.get("user-agent")!
    let expiry
    if (remember) {
      expiry = new Date()
      expiry.setHours(0, 0, 0, 0)
      expiry.setDate(expiry.getDate() + 31)
    }

    const session = await createSession(result?.user!.id, browser, ipv4, expiry)
    if (!session) {
      return NextResponse.json({ success: false, message: "Error al crear la sesión" }, { status: 500 })
    }
    const mixedResult = {
      ...result,
      session: {
        id: session.id,
        expiry: session.expiry,
        ipv4: session.ipv4,
        browser: session.browser,
      },
    }
    return NextResponse.json(mixedResult, { status: 200 })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
