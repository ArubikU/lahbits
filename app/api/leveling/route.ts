
import { authHeaders } from "@/lib/api-auth"
import { getNextLevelInfo } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const result = await getNextLevelInfo(user.current_level,user.prestige_level)

    return NextResponse.json({ success: true, result })
}
