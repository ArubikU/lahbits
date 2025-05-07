import { authHeaders } from "@/lib/api-auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    // Obtener parámetros de la consulta
    const params = request.nextUrl.searchParams
    const state_search = params.get("state")
    let state: undefined | boolean = undefined
    if (state_search) {
        if (state_search.toUpperCase() === "COMPLETED") {
            const result = await getUserQuizzes(user.id, true)
            return NextResponse.json({ success: true, result })
        }
        state = state_search.toUpperCase() === "TRUE"
    }
    
    // Obtener todos los quizzes del usuario
    let result = await getUserQuizzes(user.id, state) as Quiz[]

    // Ordenar los resultados según la fecha de creación y favoritos
    result = result.sort((a, b) => {
        if (!a.is_completed) {
            if (a.favorite && !b.favorite) return -1
            if (!a.favorite && b.favorite) return 1
        }
        if (a.created_at && b.created_at) {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        return 0
    })

    return NextResponse.json({ success: true, result })
}

export async function POST(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const action = params.get("action")
    if (!action) {
        return NextResponse.json({ success: false, message: "Action not specified" }, { status: 400 })
    }

    if (action === "complete") {
        const { quizId } = await request.json()
        if (!quizId) {
            return NextResponse.json({ success: false, message: "No quiz ID provided" }, { status: 400 })
        }
        const result = await completeQuiz(quizId)
        return NextResponse.json({ success: true, result })
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { quizId } = await request.json()
    if (!quizId) {
        return NextResponse.json({ success: false, message: "No quiz ID provided" }, { status: 400 })
    }

    const result = await deleteQuiz(quizId)
    return NextResponse.json({ success: true, result })
}
