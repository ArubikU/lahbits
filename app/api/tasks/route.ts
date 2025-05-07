
import { authHeaders } from "@/lib/api-auth"
import { completeTask, createTask, deleteTask, getUserFailedAtNowTasks, getUserTasks, markTaskAsFavorite, validateTaskPin } from "@/lib/db"
import { Task } from "@/types"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    //get state from query
    const params = request.nextUrl.searchParams
    
    let state_search = params.get("state")
    let state: undefined | boolean = undefined
    if(state_search){
        if(state_search.toLocaleUpperCase() === "FAILED"){
            const result = await getUserFailedAtNowTasks(user.id)
            return NextResponse.json({ success: true, result })
        }
        state = state_search.toLocaleUpperCase() === "TRUE"
    }
    let result = await getUserTasks(user.id,state) as Task[]

    //sort result by deadline and favorite
    result = result.sort((a, b) => {
        if(!a.is_completed){

            if (a.favorite && !b.favorite) return -1
            if (!a.favorite && b.favorite) return 1
        }
        if (a.deadline && b.deadline) {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        }
        return 0
    })

    return NextResponse.json({ success: true, result })
}

export async function PATCH(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const {taskId, completed } = await request.json()
    if(!taskId){
        return NextResponse.json({ success: false, message: "No se ha enviado el id de la tarea" }, { status: 400 })
    }
    let result = {}
    if(completed){
         result = await completeTask(taskId)
    }
    return NextResponse.json({ success: true, result })
}

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
    if(action === "complete"){
        const {taskId} = await request.json()
        if(!taskId){
            return NextResponse.json({ success: false, message: "No se ha enviado el id de la tarea" }, { status: 400 })
        }
        const result = await completeTask(taskId)
        return NextResponse.json({ success: true, result })
    }
    if(action === "favorite"){
        const {taskId} = await request.json()
        if(!taskId){
            return NextResponse.json({ success: false, message: "No se ha enviado el id de la tarea" }, { status: 400 })
        }
        const result = await markTaskAsFavorite( taskId,user.id, true)
        return NextResponse.json({ success: true,  result })
    }
    if(action === "unfavorite"){
        const {taskId} = await request.json()
        if(!taskId){
            return NextResponse.json({ success: false, message: "No se ha enviado el id de la tarea" }, { status: 400 })
        }
        const result = await markTaskAsFavorite( taskId,user.id, true)
        return NextResponse.json({ success: true,  result })
    }
    if(action === "create"){

        const {userId, title, description, xpReward, statId, deadline, pin} = await request.json()
        if(!pin){
            return NextResponse.json({ success: false, message: "No se ha enviado el pin" }, { status: 400 })
        }
        //verify if the deadline is in the future
        if(deadline && new Date(deadline).getTime() < new Date().getTime()){
            return NextResponse.json({ success: false, message: "La fecha de entrega no puede ser en el pasado" }, { status: 400 })
        }

        const valid = await validateTaskPin(pin, userId)
        if(!valid || !valid.success){
            return NextResponse.json({ success: false, message: "El pin no es válido" }, { status: 400 })
        }
        if(!userId || !title || !description || !xpReward || !statId){
            return NextResponse.json({ success: false, message: "No se han enviado todos los datos" }, { status: 400 })
        }
        const result = await createTask({userId, title, description, xpReward, statId, deadline})
        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, result: result.result })
    }
}

export async function DELETE(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const {taskId} = await request.json()
    if(!taskId){
        return NextResponse.json({ success: false, message: "No se ha enviado el id de la tarea" }, { status: 400 })
    }
    const result = await deleteTask(taskId)
    return NextResponse.json({ success: true, result })
}