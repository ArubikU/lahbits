import { removeSession } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "No sessionId" }, { status: 400 })
    }
    const result = await removeSession(sessionId)
    return NextResponse.json({ success: true, result })
}