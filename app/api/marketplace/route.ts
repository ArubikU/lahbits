
import { authHeaders } from "@/lib/api-auth"
import { createMarketplaceItem, deleteMarketplaceItem, getMarketplaceItems, getUserPurchases, purchaseMarketplaceItem, toggleMarketplaceItem, updateMarketplaceItem } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    //get state from query
    const params = request.nextUrl.searchParams

    let search_type = params.get("st")
    let state: undefined | boolean = undefined
    if (search_type) {
        if (search_type.toLocaleUpperCase() === "PURCHASES") {
            const result = await getUserPurchases(user.id)
            return NextResponse.json({ success: true, result })
        }
        if (search_type.toLocaleUpperCase() === "ITEMS") {
            const result = await getMarketplaceItems(user.id)
            return NextResponse.json({ success: true, result })
        }
    }

    return NextResponse.json({ success: false, message: "No se ha enviado el tipo de búsqueda" }, { status: 400 })
}


export async function POST(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const action = params.get("action")
    if (!action) {
        return NextResponse.json({ success: false, message: "Action nos stablished" }, { status: 400 })
    }
    if (action === "create") {
        let { name, description, price, maxPurchases } = await request.json()
        if (!name || !description || !price) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 })
        }
        if (!maxPurchases) {
            maxPurchases = 1
        }
        const result = await createMarketplaceItem({ name, description, price, maxPurchases, userId: user.id })
        if (!result) {
            return NextResponse.json({ success: false, message: "Error creating" }, { status: 500 })
        }
        return NextResponse.json(result)
    }
    if (action === "toggle") {
        const { id } = await request.json()
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 })
        }
        const result = await toggleMarketplaceItem(id, user.id);
        if (!result) {
            return NextResponse.json({ success: false, message: "Error updating" }, { status: 500 })
        }
        return NextResponse.json(result)
    }
    if (action === "purchase") {
        const { id } = await request.json()
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 })
        }
        const result = await purchaseMarketplaceItem(id, user.id);
        if (!result) {
            return NextResponse.json({ success: false, message: "Error updating" }, { status: 500 })
        }
        return NextResponse.json(result)
    }
    if (action === "update") {
        return NextResponse.json({ success: false, message: "Not valid action" }, { status: 400 })
    }
}

export async function DELETE(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id) {
        return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 })
    }
    const result = await deleteMarketplaceItem(id, user.id)
    if (!result) {
        return NextResponse.json({ success: false, message: "Error al eliminar el producto" }, { status: 500 })
    }
    return NextResponse.json(result)
}
//update marketplace item
export async function PATCH(request: NextRequest) {
    const user = await authHeaders(request)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id, name, description, price, maxPurchases } = await request.json()
    if (!id) {
        return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 })
    }
    const result = await updateMarketplaceItem({ itemId: id, userId: user.id, name, description, price, maxPurchases })
    if (!result) {
        return NextResponse.json({ success: false, message: "Error updating" }, { status: 500 })
    }
    return NextResponse.json(result)
}