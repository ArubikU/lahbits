
import { authHeaders } from "@/lib/api-auth"
import { hasPin, saveTaskPin, validateTaskPin } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const  params = request.nextUrl.searchParams
    const action = params.get("action")
    if(!action){
        return NextResponse.json({ success: false, message: "Action nos stablished" }, { status: 400 })
    }
    if(action === "create"){
        const {pin} = await request.json()
        if(!pin){
            return NextResponse.json({ success: false, message: "No se ha enviado el pin" }, { status: 400 })
        }
        console.log("pin",pin)
        const result = await saveTaskPin(pin,user.id)
        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, result })
    }
    if(action === "update"){

        const {pin,newPin} = await request.json()
        if(!pin){
            return NextResponse.json({ success: false, message: "No se ha enviado el pin" }, { status: 400 })
        }
        if(!newPin){
            return NextResponse.json({ success: false, message: "No se ha enviado el nuevo pin" }, { status: 400 })
        }
        const result = await saveTaskPin(newPin,user.id,pin)
        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, result })
    }
    if( action === "validate"){
        const {pin} = await request.json()
        if(!pin){
            return NextResponse.json({ success: false, message: "No se ha enviado el pin" }, { status: 400 })
        }
        console.log("pin",pin)
        const result = await validateTaskPin(pin,user.id)
        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, result })
    }
    return NextResponse.json({ success: false, message: "Action nos stablished" }, { status: 400 })
}

export async function GET(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const hp = await hasPin(user.id)
    console.log("has pin",hp)
    return NextResponse.json({ success: true, result: hp })

}