/**
 * @spec docs/SPEC-SDD.md#tela-5-legenda
 * @description Gera legenda automática via LLM (Groq Qwen3-32B primário).
 * @author Mavis
 *
 * POST body aceita garmentTypes (array) OU garmentType (string legado).
 *
 * Refs: docs/SPEC-SDD.md#tela-5-legenda
 */
import { NextRequest, NextResponse } from "next/server";
import { captionRequestSchema } from "@/lib/schemas/caption";
import { generateCaptions, extractHashtags, type CaptionInput } from "@/lib/groq/client";
import { joinGarmentTypes } from "@/lib/schemas/config";

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
      garmentTypes,
      garmentType,
      size,
      price,
      style,
      description,
      tone,
      defaultHashtags,
      variationCount,
    } = parsed.data;

    const input: CaptionInput = {
      garmentTypes: garmentTypes ?? [],
      garmentType: garmentType ?? joinGarmentTypes(garmentTypes ?? []),
      size,
      price,
      style,
      description,
      defaultHashtags,
      tone,
    };

    const captions = await generateCaptions(input, variationCount);
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

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "POST com { garmentTypes? | garmentType?, size, price, style, description?, tone?, defaultHashtags?, variationCount? }",
  });
}