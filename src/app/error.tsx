/**
 * @spec docs/SPEC-SDD.md#integracao-e2e
 * @description Error boundary global do App Router (rota atual).
 * @author Mavis
 *
 * Captura erros em runtime dentro da rota atual.
 * Mostra mensagem amigável + botão de reset.
 * Next.js procura `error.tsx` mais próximo na árvore de rotas.
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error.tsx] erro capturado:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Algo deu errado
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Encontramos um problema ao carregar esta tela. Pode tentar de novo ou
          voltar pro começo.
        </p>

        {error.digest && (
          <p className="text-xs text-zinc-400 font-mono break-all">
            Erro: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <button
            type="button"
            onClick={reset}
            className="min-h-[48px] px-6 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold transition-colors"
          >
            🔄 Tentar de novo
          </button>
          <Link
            href="/"
            className="min-h-[48px] px-6 inline-flex items-center justify-center rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
          >
            ← Voltar pro começo
          </Link>
        </div>
      </div>
    </main>
  );
}