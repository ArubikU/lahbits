import { NextRequest } from "next/server"
import bcrypt from "./bcrypt"
import { getUserBySessionId, getUserByUsername } from "./db"

export async function authHeaders(nextRequest: NextRequest) {
  const authHeader = nextRequest.headers.get("authorization")
  if (!authHeader) {
    return null
  }
  const token = authHeader.split(" ")[1]
  if (!token) {
    return null
  }
  const user = await getUserBySessionId(token)
    if (!user) {
        return null
    }
    return user
}

export async function login(username: string, password: string) {
  const user = await getUserByUsername(username)
  if (!user) {
    return { success: false, message: "Usuario no encontrado" }
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash)

  if (!passwordMatch) {
    return { success: false, message: "Contraseña incorrecta" }
  }


  return { success: true, user }
}