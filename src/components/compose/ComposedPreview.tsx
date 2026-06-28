/**
 * @spec docs/SPEC-SDD.md#tela-4-composicao
 * @description Preview da imagem composta (com texto sobreposto).
 * @author Mavis
 */
"use client";

import { cn } from "@/lib/utils";

type ComposedPreviewProps = {
  composedUrl: string | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function ComposedPreview({
  composedUrl,
  loading = false,
  error = null,
  onRetry,
}: ComposedPreviewProps) {
  if (error) {
    return (
      <div className="aspect-[4/5] w-full rounded-2xl border-2 border-dashed border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-2">⚠️</div>
        <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
          Erro ao gerar preview
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mb-3 max-w-xs">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[40px] px-4 text-sm rounded-xl border-2 border-red-300 dark:border-red-700 bg-white dark:bg-zinc-900 text-red-700 dark:text-red-300 font-medium"
          >
            Tentar de novo
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="aspect-[4/5] w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Aplicando texto...</p>
      </div>
    );
  }

  if (!composedUrl) {
    return (
      <div className="aspect-[4/5] w-full rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center text-center p-6">
        <div className="text-4xl mb-2">🖼️</div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Preencha os campos pra ver o preview
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700",
        "bg-zinc-100 dark:bg-zinc-900"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={composedUrl}
        alt="Preview do post com texto sobreposto"
        className="w-full h-auto block"
        loading="lazy"
      />
    </div>
  );
}