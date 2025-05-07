import { put } from "@vercel/blob";
import { nanoid } from "nanoid";


export async function uploadFile(file: Blob, userId: string) {
  try {
    console.log("Uploading file:", file);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `file-${userId}-${nanoid()}.${file.type.split("/")[1]}`;
    const blob = await put(filename, buffer, {
      access: "public",
    });

    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, error: "Error al subir el archivo" };
  }
}