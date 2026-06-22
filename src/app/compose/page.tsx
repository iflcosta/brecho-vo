/**
 * @spec docs/SPEC-SDD.md#tela-4-composicao
 * @description Tela 4 — Composição de texto na imagem (PLACEHOLDER)
 * @author Mavis
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const GENERATED_STORAGE_KEY = "brecho-generated-image";

export default function ComposePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      setImageUrl(localStorage.getItem(GENERATED_STORAGE_KEY));
    } catch {
      // localStorage indisponível
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Link href="/generate" className="text-pink-600 dark:text-pink-400 text-2xl" aria-label="Voltar">
            ←
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Composição
          </h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        <div className="text-center space-y-4">
          <div className="text-6xl">✍️</div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Tela 4 (Composição)
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Em construção — a implementar na próxima seção.
          </p>

          {imageUrl && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-700 dark:text-green-300">
              ✓ Imagem gerada recebida da Tela 3
            </div>
          )}

          <div className="mt-6 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left text-sm">
            <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Próxima seção implementará:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>Preview da imagem com texto sobreposto</li>
              <li>Editor de texto (tamanho, preço, hashtags)</li>
              <li>Chamar POST /api/compose</li>
              <li>Botão "Avançar" pra Tela 5 (Legenda)</li>
            </ul>
          </div>

          <Link href="/generate" className="inline-block mt-4">
            <Button type="button" variant="outline">
              ← Voltar pra Geração
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
