/**
 * @spec docs/SPEC-SDD.md#tela-3-geracao
 * @description Loading state durante geração VTON (com tempo decorrido)
 * @author Mavis
 */
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export type GeneratingStateProps = {
  /** URL da imagem original (mostrada como thumb) */
  originalImageUrl: string;
  /** Segundos decorridos desde o início */
  elapsedSeconds: number;
  /** Callback de cancelar (volta pro estado idle) */
  onCancel: () => void;
};

export function GeneratingState({
  originalImageUrl,
  elapsedSeconds,
  onCancel,
}: GeneratingStateProps) {
  // Estimativa simples: VTON pode levar 30-90s
  const estimate = elapsedSeconds < 30 ? 30 : 90;
  const progress = Math.min(100, (elapsedSeconds / estimate) * 100);

  return (
    <div className="space-y-4">
      {/* Imagem original (thumb) com overlay de loading */}
      <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={originalImageUrl}
          alt="Imagem original"
          fill
          className="object-cover opacity-50"
          unoptimized
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white font-semibold text-lg">Gerando imagem...</p>
          <p className="text-white/80 text-sm">
            ⏳ ~{estimate}s (decorrido: {elapsedSeconds}s)
          </p>
        </div>
      </div>

      {/* Barra de progresso (estimativa) */}
      <div className="max-w-sm mx-auto">
        <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={elapsedSeconds}
            aria-valuemin={0}
            aria-valuemax={estimate}
          />
        </div>
      </div>

      {/* Botão Cancelar */}
      <div className="max-w-sm mx-auto">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full">
          ✕ Cancelar
        </Button>
      </div>
    </div>
  );
}
