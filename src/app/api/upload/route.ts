/**
 * @spec docs/SPEC-SDD.md#4.3-post-apiupload
 * @description Recebe upload de imagem, salva no Cloudinary, retorna URL
 * @author Mavis
 *
 * Status: ESQUELETO (Tela 1 — Upload)
 * Refs: docs/SPEC-SDD.md#tela-1-upload
 */
import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Nenhuma imagem enviada" },
        { status: 400 }
      );
    }

    // Validações básicas
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Imagem muito grande. Máximo 10MB." },
        { status: 400 }
      );
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Formato inválido. Use JPG, PNG ou WebP." },
        { status: 400 }
      );
    }

    // Converte para data URL (Cloudinary aceita)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    const { url, publicId } = await uploadImage(dataUrl, "brecho/originals");

    return NextResponse.json({ success: true, url, publicId });
  } catch (error) {
    console.error("[api/upload] erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar upload" },
      { status: 500 }
    );
  }
}
