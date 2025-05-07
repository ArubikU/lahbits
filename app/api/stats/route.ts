
import { authHeaders } from "@/lib/api-auth"
import { createStat, deleteStat, getUserStats, updateStat, updateUserProfile } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const result = await getUserStats(user.id)
    return NextResponse.json({ success: true, result })
}

export async function POST(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }


    const params = request.nextUrl.searchParams
    const action = params.get("action")

    if (action === "create") {
        const { name, categoryId, currentValue, maxValue } = await request.json()
        const result = await createStat({ userId: user.id, name, categoryId, currentValue, maxValue })
        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 })
        }
        return NextResponse.json(result);
    }

    const { nickname, fullName, themeId, birthDate, gender, isStudent, isWorking, profileImage } = await request.json()
    const result = await updateUserProfile({ userId: user.id, nickname, fullName, themeId, birthDate, gender, isStudent, isWorking, profileImage })
    if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 500 })
    }
    return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const action = params.get("action")

    if (action === "delete") {
        const { statId } = await request.json()
        const result = await deleteStat({ userId: user.id, statId })
        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 })
        }
        return NextResponse.json(result);
    }
}

export async function PATCH(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const action = params.get("action")
    if (action === "update") {
        const { statId, name, currentValue, maxValue } = await request.json()
        const result = await updateStat({ userId: user.id, statId, name, currentValue, maxValue })
        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 })
        }
        return NextResponse.json(result);
    }
    return NextResponse.json({ success: false, message: "Not valid action" }, { status: 400 })
}
