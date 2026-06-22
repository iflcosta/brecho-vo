/**
 * @spec docs/SPEC-SDD.md#tela-4-composicao
 * @description Adiciona texto sobreposto na imagem (tamanho, preço, hashtags, @ da loja)
 * @author Mavis
 *
 * Status: ESQUELETO (Tela 4 — Composição)
 *
 * Esta rota delega para Cloudinary (text overlay) ou usa Canvas no client.
 * MVP: server-side via Cloudinary transformations (mais consistente).
 * Refs: docs/SPEC-SDD.md#5-composicao-de-texto-na-imagem
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageUrl,
      size,
      price,
      hashtags,
      instagramHandle,
      postId,
    } = body as {
      imageUrl?: string;
      size?: string;
      price?: string;
      hashtags?: string;
      instagramHandle?: string;
      postId?: string;
    };

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "imageUrl é obrigatório" },
        { status: 400 }
      );
    }

    // TODO (Tela 4): implementar overlay de texto via Cloudinary ou Canvas
    // Cloudinary: usar `l_text`, `co_white`, `b_rgb:00000080` para text overlay
    // Exemplo URL Cloudinary:
    //   https://res.cloudinary.com/<cloud>/image/upload/l_text:Inter_48_bold:TAM%20M,co_white,b_rgb:00000080/<image>
    //
    // Por enquanto: retorna a imagem sem modificações
    const finalImageUrl = imageUrl;

    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { finalImage: finalImageUrl },
      });
    }

    return NextResponse.json({ success: true, finalImageUrl });
  } catch (error) {
    console.error("[api/compose] erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao compor imagem" },
      { status: 500 }
    );
  }
}
