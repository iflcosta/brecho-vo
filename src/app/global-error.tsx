/**
 * @spec docs/SPEC-SDD.md#integracao-e2e
 * @description Error boundary root do App Router.
 * Captura erros fora do layout principal (ex: falha no próprio <html>).
 * @author Mavis
 */
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-6xl">💥</div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Erro grave
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Ocorreu um problema crítico. Tente recarregar a página.
          </p>

          {error.digest && (
            <p className="text-xs text-zinc-400 font-mono break-all">
              {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            className="min-h-[48px] px-6 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold transition-colors"
          >
            🔄 Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}