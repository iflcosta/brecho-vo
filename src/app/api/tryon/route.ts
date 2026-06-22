/**
 * @spec docs/SPEC-SDD.md#4.1-post-apitryon
 * @description Job assíncrono de VTON (Virtual Try-On).
 * @author Mavis
 *
 * Fluxo:
 * 1. POST: cria Generation(status="processing") e retorna { generationId } imediatamente
 * 2. Background: processa VTON (HF Spaces / FASHN) e atualiza status pra "done"/"failed"
 * 3. GET ?id=...: retorna o status atual pro frontend fazer polling
 *
 * Importante: VTON demora 30-90s. Vercel Hobby tem max 300s (5 min) — suficiente.
 * Implementação: processamos "fire-and-forget" via Promise sem await no POST.
 * Refs: docs/SPEC-SDD.md#tela-3-geracao
 */
import { NextRequest, NextResponse } from "next/server";
import { tryOn } from "@/lib/huggingface/client";
import { prisma } from "@/lib/db/prisma";

// Força runtime Node (não Edge) — HF Spaces client precisa de Node APIs
export const runtime = "nodejs";

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

    // 1. Cria registro de Generation (status: processing)
    const generation = await prisma.generation.create({
      data: {
        status: "processing",
        provider: process.env.VTON_PROVIDER ?? "hf",
        inputImageUrl: mannequinImageUrl,
      },
    });

    // 2. Processa VTON em background (fire-and-forget)
    // Não usamos await aqui — a resposta volta imediatamente
    processVTONInBackground(generation.id, mannequinImageUrl).catch((err) => {
      console.error(`[api/tryon] background error for ${generation.id}:`, err);
    });

    // 3. Retorna imediatamente o ID pra o cliente fazer polling
    return NextResponse.json({
      success: true,
      generationId: generation.id,
      status: "processing",
    });
  } catch (error) {
    console.error("[api/tryon] POST erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao iniciar geração. Tente novamente.",
        code: "VTON_SERVICE_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * Processa o VTON em background e atualiza o status.
 * Roda sem await no caller — Vercel Hobby aguenta até 300s.
 */
async function processVTONInBackground(generationId: string, imageUrl: string) {
  const start = Date.now();
  try {
    const result = await tryOn({ mannequinImageUrl: imageUrl });
    const durationMs = Date.now() - start;

    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: "done",
        outputImageUrl: result.imageUrl,
        durationMs,
      },
    });
  } catch (err) {
    const message = (err as Error).message ?? "Falha desconhecida";
    console.error(`[api/tryon] failed for ${generationId}:`, message);
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: "failed",
        errorMessage: message,
      },
    });
  }
}

/**
 * GET — endpoint de polling (status do job)
 * Usado pelo frontend pra verificar se a geração terminou.
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
