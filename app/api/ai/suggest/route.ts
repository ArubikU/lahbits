
import { suggestTask } from "@/lib/ai-client"
import { authHeaders } from "@/lib/api-auth"
import { type NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const {title, description, xpReward, stat,stats, deadline, lastTasks} = await request.json()

    if (!title || !description || !xpReward ) {
        return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }
    const result = await suggestTask({
        title,
        description,
        xpReward,
        stat,
        stats,
        deadline,
        lastTasks,
        user
    })
    return NextResponse.json(result, { status: result.success ? 200 : 500 })
}
