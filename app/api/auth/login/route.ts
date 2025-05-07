import { login } from "@/lib/api-auth"
import { createSession } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password, remember } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    let result = await login(username, password)
    if(!result.success) {

      return NextResponse.json({success: false, message: "Cuenta o contraseña invalida"},{ status: 200})
    }
    const browser = request.headers.get("user-agent")!
    const ipv4 = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")!

    let expiry
    if(remember){
      //set expiry date 31 days after now
      expiry = new Date()
      expiry.setHours(0, 0, 0, 0);
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
