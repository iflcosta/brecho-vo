/**
 * @spec docs/SPEC-SDD.md#4.2-post-apicaptain
 * @description Gera legenda automática via LLM (Groq primário, fallback multi-provider)
 * @author Mavis
 *
 * Status: ESQUELETO (Tela 5 — Legenda)
 * Refs: docs/SPEC-SDD.md#tela-5-legenda
 */
import { NextRequest, NextResponse } from "next/server";
import { generateCaption } from "@/lib/groq/client";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { garmentType, size, price, style, description, tone, postId } = body as {
      garmentType?: string;
      size?: string;
      price?: string;
      style?: string;
      description?: string;
      tone?: "casual" | "elegante" | "divertido";
      postId?: string;
    };

    // Validação
    if (!garmentType || !size || !price || !style) {
      return NextResponse.json(
        {
          success: false,
          error: "Campos obrigatórios: garmentType, size, price, style",
        },
        { status: 400 }
      );
    }

    // Busca hashtags padrão das settings (ou usa default)
    const settings = await prisma.settings.findFirst();
    const defaultHashtags =
      settings?.defaultHashtags ?? "#brechó #modavintage #brechóonline";

    const caption = await generateCaption({
      garmentType,
      size,
      price,
      style,
      description,
      defaultHashtags,
      tone,
    });

    // Se veio postId, persiste a legenda no post
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { caption },
      });
    }

    // Extrai hashtags (regex simples)
    const hashtags = caption.match(/#[a-zA-Z0-9_]+/g) ?? [];

    return NextResponse.json({ success: true, caption, hashtags });
  } catch (error) {
    console.error("[api/caption] erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao gerar legenda. Tente novamente." },
      { status: 500 }
    );
  }
}
