
import { authHeaders } from "@/lib/api-auth"
import { getUserStreak, getUserStreakBonuses, recoverStreak, updateStreakSettings } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const params = request.nextUrl.searchParams

    if(params.get("bonuses")! === "true"){
        const result = await getUserStreakBonuses(user.id)
        return NextResponse.json({ success: true, result })
    }

    const result = await getUserStreak(user.id)

    return NextResponse.json({ success: true, result })
}


export async function POST(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const params = request.nextUrl.searchParams

    if(params.get("recover")! === "true"){
        const result = await recoverStreak(user.id)
        return NextResponse.json({ success: true, result })
    }
    if(params.get("update")! === "true"){
        
        const {recoveryCost,bonusRanges} = await request.json()
        if(!recoveryCost || !bonusRanges){
            return NextResponse.json({ success: false, message: "Faltan campos!" }, { status: 401 })
        }
        const result = await updateStreakSettings({userId: user.id,recoveryCost,bonusRanges})
        if(result.success){
            return NextResponse.json({ success: true, result })
        }else{
            return NextResponse.json({ success: false, message: "Error" }, { status: 400 })
        }
    }

    return NextResponse.json({ success: true })
}
