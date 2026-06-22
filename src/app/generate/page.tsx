/**
 * @spec docs/SPEC-SDD.md#tela-3-geracao
 * @description Tela 3 — Geração da imagem (PLACEHOLDER)
 * @author Mavis
 *
 * Status: PLACEHOLDER
 * A implementar: chamar /api/tryon com polling, loading state, preview
 * da imagem gerada, botões "Regerar" e "Avançar"
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GeneratePage() {
  const [hasImage, setHasImage] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setHasImage(!!localStorage.getItem("brecho-original-image"));
    } catch {
      setHasImage(false);
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Link
            href="/config"
            className="text-pink-600 dark:text-pink-400 text-2xl"
            aria-label="Voltar"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Gerando imagem
          </h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        <div className="text-center space-y-4">
          <div className="text-6xl">⏳</div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Tela 3 (Geração)
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Em construção — a implementar na próxima seção.
          </p>

          <div className="mt-6 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left text-sm">
            <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Próxima seção implementará:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>POST /api/tryon com a imageUrl do upload</li>
              <li>Loading state (~30-90s)</li>
              <li>Polling do status via GET /api/tryon?id=...</li>
              <li>Preview da imagem com modelo virtual</li>
              <li>Botão "Regerar" (até 3x) + "Avançar"</li>
            </ul>
            {hasImage && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-3">
                ✓ Imagem encontrada no localStorage
              </p>
            )}
          </div>

          <Link href="/config" className="mt-4 inline-block">
            <Button type="button" variant="outline">
              ← Voltar pra Config
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
