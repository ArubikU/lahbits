
import { authHeaders } from "@/lib/api-auth";
import { uploadFile } from "@/lib/blob";
import { type NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const user = await authHeaders(req)
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        const url = await uploadFile(file, user.id);
        if (!url.success) {
            return NextResponse.json({ error: url.error }, { status: 500 });
        }
        return NextResponse.json(url);
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}