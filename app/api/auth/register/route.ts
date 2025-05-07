import { createSession, registerUser } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
export async function POST(request: NextRequest) {
  try {
    const { username, nickname, password,expiry,birthDate,notifications } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Usuario y contraseña son requeridos" }, { status: 400 })
    }
    const result = await registerUser({username,password,nickname,birthDate,notifications})
    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    const browser = request.headers.get("user-agent")!
    const ipv4 = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")!
    const session = await createSession(result.user?.id, browser, ipv4, expiry)  
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
    return NextResponse.json(mixedResult)
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
