
import { generateTasks } from "@/lib/ai-client"
import { authHeaders } from "@/lib/api-auth"
import { type NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const { prompt, stats } = await request.json()
    if (!prompt || !Array.isArray(stats)) {
        return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 })
    }

    try {
        const tasks = await generateTasks(prompt, user, stats)
        return NextResponse.json({ success: true, result: tasks }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Failed to generate tasks", error: error.message }, { status: 500 })
    }
}
