/**
 * @spec docs/SPEC-SDD.md#tela-3-geracao
 * @description Tela 3 — Geração da imagem com modelo virtual (VTON)
 * @author Mavis
 *
 * State machine:
 * - idle: usuário acabou de chegar, pronto pra começar
 * - submitting/polling: VTON rodando
 * - done: imagem gerada, mostra Regerar/Avançar
 * - failed: erro, mostra retry
 *
 * Limite: 3 regerações por sessão (RNF do SPEC).
 * Persistência: generatedImageUrl no localStorage pra Tela 4 usar.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { useTryOn } from "@/lib/hooks/use-tryon";
import { GeneratingState } from "@/components/generation/GeneratingState";
import { GeneratedPreview } from "@/components/generation/GeneratedPreview";
import { Button } from "@/components/ui/button";

const IMAGE_STORAGE_KEY = "brecho-original-image";
const GENERATED_STORAGE_KEY = "brecho-generated-image";
const MAX_REGENS = 3;

export default function GeneratePage() {
  const router = useRouter();
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [regenCount, setRegenCount] = useState(0);
  const { phase, result, error, elapsedSeconds, start, reset } = useTryOn();

  // Carrega URL do localStorage e começa geração automaticamente
  useEffect(() => {
    try {
      const url = localStorage.getItem(IMAGE_STORAGE_KEY);
      setOriginalImageUrl(url);
      if (url) {
        // Auto-start na primeira vez que chega
        start(url);
      }
    } catch {
      // localStorage indisponível
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quando terminar com sucesso, persiste a URL gerada
  useEffect(() => {
    if (phase === "done" && result) {
      try {
        localStorage.setItem(GENERATED_STORAGE_KEY, result.imageUrl);
      } catch {
        // ignora
      }
    }
  }, [phase, result]);

  function handleRegenerate() {
    if (regenCount >= MAX_REGENS) return;
    if (!originalImageUrl) return;
    setRegenCount((c) => c + 1);
    start(originalImageUrl);
  }

  function handleAdvance() {
    if (phase !== "done" || !result) return;
    router.push("/compose");
  }

  // Estado vazio: usuário chegou sem ter feito upload
  if (hydrated && !originalImageUrl) {
    return (
      <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <Link href="/" className="text-pink-600 dark:text-pink-400 text-2xl" aria-label="Voltar">
              ←
            </Link>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Gerando imagem
            </h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="text-5xl">📷</div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Nenhuma foto encontrada
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Você precisa fazer upload de uma foto antes de gerar.
            </p>
            <Link
              href="/"
              className="inline-block h-12 px-6 bg-pink-600 text-white font-semibold rounded-xl leading-[3rem] hover:bg-pink-700 transition-colors"
            >
              Ir pro Upload
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="sticky top-0 z-10 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Link
            href="/config"
            className="text-pink-600 dark:text-pink-400 text-2xl"
            aria-label="Voltar"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {phase === "done" ? "Imagem gerada!" : "Gerando imagem..."}
          </h1>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
            {phase === "done" ? "Pronto!" : "Transformando manequim em modelo"}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {phase === "done"
              ? "Veja como ficou e decida se avança ou regenera."
              : "A IA está gerando uma modelo virtual com a roupa. Pode demorar até 90s."}
          </p>
        </div>

        <div className="flex items-start justify-center">
          {/* Loading state */}
          {(phase === "submitting" || phase === "polling") && originalImageUrl && (
            <GeneratingState
              originalImageUrl={originalImageUrl}
              elapsedSeconds={elapsedSeconds}
              onCancel={reset}
            />
          )}

          {/* Success state */}
          {phase === "done" && result && (
            <GeneratedPreview
              imageUrl={result.imageUrl}
              regenCount={regenCount}
              maxRegens={MAX_REGENS}
              onRegenerate={handleRegenerate}
              onAdvance={handleAdvance}
              isRegenerating={false}
            />
          )}

          {/* Error state */}
          {phase === "failed" && error && (
            <div className="max-w-sm mx-auto space-y-4 text-center">
              <div className="text-6xl">😔</div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Ops, algo deu errado
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{error.message}</p>
              {error.code === "TIMEOUT" && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Os servidores de IA estão ocupados. Tente novamente em alguns instantes.
                </p>
              )}
              <div className="space-y-2">
                <Button type="button" size="lg" onClick={reset} className="w-full">
                  ↻ Tentar novamente
                </Button>
                <Link href="/config">
                  <Button type="button" variant="outline" className="w-full">
                    ← Voltar pra Config
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Idle (antes de começar) */}
          {phase === "idle" && hydrated && originalImageUrl && (
            <div className="max-w-sm mx-auto text-center space-y-4">
              <div className="text-5xl">⏳</div>
              <p className="text-zinc-600 dark:text-zinc-400">Preparando geração...</p>
              <Button type="button" onClick={() => start(originalImageUrl)} className="w-full">
                Iniciar geração
              </Button>
            </div>
          )}
        </div>

        {/* Debug info em dev */}
        {process.env.NODE_ENV === "development" && phase !== "idle" && (
          <div className="mt-6 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-xs text-zinc-500 font-mono">
            <p>phase: {phase}</p>
            <p>elapsed: {elapsedSeconds}s</p>
            <p>regens: {regenCount}/{MAX_REGENS}</p>
            {error && <p>code: {error.code}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
