/**
 * @spec docs/SPEC-SDD.md#tela-3-geracao
 * @description Preview da imagem gerada + botões Regerar e Avançar
 * @author Mavis
 */
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export type GeneratedPreviewProps = {
  /** URL da imagem gerada (Cloudinary) */
  imageUrl: string;
  /** Quantas vezes já regerou (0-3) */
  regenCount: number;
  /** Max regerações permitido (default 3) */
  maxRegens?: number;
  /** Callback pra regerar */
  onRegenerate: () => void;
  /** Callback pra avançar pra próxima tela */
  onAdvance: () => void;
  /** Se está regerando no momento */
  isRegenerating?: boolean;
};

export function GeneratedPreview({
  imageUrl,
  regenCount,
  maxRegens = 3,
  onRegenerate,
  onAdvance,
  isRegenerating = false,
}: GeneratedPreviewProps) {
  const canRegen = regenCount < maxRegens;

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-pink-300 dark:border-pink-800 bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={imageUrl}
          alt="Imagem gerada com modelo virtual"
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="max-w-sm mx-auto space-y-3">
        {/* Botão Regerar */}
        {canRegen ? (
          <Button
            type="button"
            variant="outline"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="w-full"
          >
            {isRegenerating ? "Regerando..." : `↻ Regerar (${regenCount}/${maxRegens})`}
          </Button>
        ) : (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Limite de {maxRegens} regerações atingido. Use esta imagem ou volte pro upload.
            </p>
          </div>
        )}

        {/* Botão Avançar */}
        <Button
          type="button"
          size="lg"
          onClick={onAdvance}
          disabled={isRegenerating}
          className="w-full"
        >
          Avançar →
        </Button>
      </div>
    </div>
  );
}
