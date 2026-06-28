/**
 * @spec docs/SPEC-SDD.md#tela-5-legenda
 * @description Gera legenda automática via LLM (Groq Qwen3-32B primário).
 * @author Mavis
 *
 * POST body:
 *   - garmentType, size, price, style (obrigatórios)
 *   - description?, tone? (opcional)
 *   - defaultHashtags? (default "#brecho #modasusada #brechoonline")
 *   - variationCount? (1-5, default 1)
 *
 * Refs: docs/SPEC-SDD.md#tela-5-legenda
 */
import { NextRequest, NextResponse } from "next/server";
import { captionRequestSchema } from "@/lib/schemas/caption";
import { generateCaptions, extractHashtags } from "@/lib/groq/client";

// Edge runtime seria ideal por latência, mas Groq SDK funciona em Node.
// Mantemos Nodejs por consistência com as outras routes.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = captionRequestSchema.safeParse(body);

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

    const {
      garmentType,
      size,
      price,
      style,
      description,
      tone,
      defaultHashtags,
      variationCount,
    } = parsed.data;

    const captions = await generateCaptions(
      {
        garmentType,
        size,
        price,
        style,
        description,
        defaultHashtags,
        tone,
      },
      variationCount
    );

    // Para a primeira variação, extrai hashtags pro frontend
    const hashtags = extractHashtags(captions[0] ?? "");

    return NextResponse.json({
      success: true,
      captions,
      hashtags,
      tone,
      variationCount,
    });
  } catch (error) {
    console.error("[api/caption] erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao gerar legenda. Tente novamente.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET — healthcheck simples
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "POST com { garmentType, size, price, style, description?, tone?, defaultHashtags?, variationCount? }",
  });
}