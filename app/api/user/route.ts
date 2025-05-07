
import { authHeaders } from "@/lib/api-auth"
import { updateUserProfile } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const result = await authHeaders(request)
    if (!result) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ success: true, result: result })
}

export async function POST(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const json = await request.json()

    const {userId,nickname,fullName,themeId,birthDate,gender,isStudent,isWorking,profileImage,isEmailNotifications} = json;
    const result = await updateUserProfile({userId,nickname,fullName,themeId,birthDate,gender,isStudent,isWorking,profileImage,isEmailNotifications})
    if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 500 })
    }
    return NextResponse.json(result);
}