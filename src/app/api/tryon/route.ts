/**
 * @spec docs/SPEC-SDD.md#4.1-post-apitryon
 * @description Inicia job assíncrono de VTON (Virtual Try-On).
 * @author Mavis
 *
 * Status: ESQUELETO (Tela 3 — Geração)
 * Refs: docs/SPEC-SDD.md#tela-3-geracao
 *
 * IMPORTANTE: VTON demora 30-90s. O Vercel Hobby tem max 300s (5 min).
 * Por enquanto: síncrono. Se necessário, migrar pra fire-and-forget + polling.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryOn } from "@/lib/huggingface/client";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mannequinImageUrl } = body as { mannequinImageUrl?: string };

    if (!mannequinImageUrl) {
      return NextResponse.json(
        { success: false, error: "URL da imagem é obrigatória" },
        { status: 400 }
      );
    }

    // Cria registro de Generation (status: processing)
    const generation = await prisma.generation.create({
      data: {
        status: "processing",
        provider: process.env.VTON_PROVIDER ?? "hf",
        inputImageUrl: mannequinImageUrl,
      },
    });

    try {
      const result = await tryOn({ mannequinImageUrl });

      // Atualiza registro como done
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: "done",
          outputImageUrl: result.imageUrl,
          durationMs: result.generationTime,
        },
      });

      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        generationId: generation.id,
        generationTime: result.generationTime,
      });
    } catch (vtonError) {
      // Marca como failed
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: "failed",
          errorMessage: (vtonError as Error).message,
        },
      });
      throw vtonError;
    }
  } catch (error) {
    console.error("[api/tryon] erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao gerar imagem. Tente novamente.",
        code: "VTON_SERVICE_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * GET — endpoint de polling (status do job)
 * Usado pelo frontend pra verificar se a geração terminou
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const generationId = searchParams.get("id");

    if (!generationId) {
      return NextResponse.json(
        { success: false, error: "ID da geração é obrigatório" },
        { status: 400 }
      );
    }

    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
    });

    if (!generation) {
      return NextResponse.json(
        { success: false, error: "Geração não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: generation.status,
      imageUrl: generation.outputImageUrl,
      error: generation.errorMessage,
    });
  } catch (error) {
    console.error("[api/tryon] GET erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar status" },
      { status: 500 }
    );
  }
}
