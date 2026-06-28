/**
 * @spec docs/SPEC-SDD.md#tela-4-composicao
 * @description Adiciona texto sobreposto na imagem (tamanho, preço, hashtags, @ da loja).
 * @author Mavis
 *
 * Server-side via Cloudinary text overlay (l_text). Não precisa re-upload.
 *
 * Fluxo:
 *  1. Recebe { imageUrl, size, price, hashtags, instagramHandle, position }
 *  2. Extrai publicId + version da URL do Cloudinary
 *  3. Monta URL com overlays (TAM + preço + rodapé)
 *  4. Retorna composedUrl pro frontend
 *
 * Refs:
 *  - https://cloudinary.com/documentation/image_transformations#adding_text_overlays
 *  - docs/SPEC-SDD.md#5-composicao-de-texto-na-imagem
 */
import { NextRequest, NextResponse } from "next/server";
import { composeRequestSchema } from "@/lib/schemas/compose";
import { parseCloudinaryUrl } from "@/lib/cloudinary/parsePublicId";
import { buildComposedUrl } from "@/lib/cloudinary/client";

// Força runtime Node — Cloudinary SDK é Node-only
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = composeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { imageUrl, size, price, hashtags, instagramHandle, position } = parsed.data;

    // Extrai publicId + version da URL do Cloudinary
    const parsed_url = parseCloudinaryUrl(imageUrl);
    if (!parsed_url) {
      return NextResponse.json(
        {
          success: false,
          error:
            "URL precisa ser do Cloudinary no formato /image/upload/v<version>/<public_id>.jpg",
        },
        { status: 400 }
      );
    }

    const composedUrl = buildComposedUrl(parsed_url.publicId, parsed_url.version, {
      size,
      price,
      hashtags,
      instagramHandle,
      position,
    });

    return NextResponse.json({
      success: true,
      composedUrl,
      publicId: parsed_url.publicId,
      version: parsed_url.version,
    });
  } catch (error) {
    console.error("[api/compose] erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao compor imagem",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET — healthcheck simples (útil pra smoke test)
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "POST com { imageUrl, size, price, hashtags?, instagramHandle?, position? }",
  });
}