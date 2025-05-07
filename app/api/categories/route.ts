
import { authHeaders } from "@/lib/api-auth"
import { createCategory, deleteCategory, getUserStatCategories, updateCategory } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const result = await getUserStatCategories(user.id)

    return NextResponse.json({ success: true, result })
}
export async function POST(request: NextRequest) {
    //action="create" -> create category ,action="update" -> update category
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const params = request.nextUrl.searchParams
    const action = params.get("action")
    if (action === "create") {
        const { name, color, icon,description } = await request.json()
        const result = await createCategory({ userId: user.id, name, color, icon,description })
        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 })
        }
        return NextResponse.json(result)
    }
    }

export async function DELETE(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const action = params.get("action")
    if (action === "delete") {
        const { categoryId } = await request.json()
        const result = await deleteCategory({ userId: user.id, categoryId })
        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 })
        }
        return NextResponse.json(result)
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
        const { categoryId, name, color, icon,description } = await request.json()
        const result = await updateCategory({categoryId, userId: user.id, name, color, icon,description })
        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 })
        }
        return NextResponse.json(result)
    }
    return NextResponse.json({ success: false, message: "Not valid action" }, { status: 400 })
}