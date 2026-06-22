/**
 * @spec docs/SPEC-SDD.md#tela-2-config
 * @description Tela 2 — Configuração do produto (PLACEHOLDER)
 * @author Mavis
 *
 * Status: PLACEHOLDER
 * Refs: STATE.md → "Próximo passo imediato" (após Tela 1)
 *
 * A implementar: form com tipo da roupa, tamanho, preço, estilo, descrição.
 * Por enquanto: só confirma que a imagem chegou via localStorage e mostra link pra voltar.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConfigPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      setImageUrl(localStorage.getItem("brecho-original-image"));
    } catch {
      // localStorage indisponível
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Link
            href="/"
            className="text-pink-600 dark:text-pink-400 text-2xl"
            aria-label="Voltar"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Configuração
          </h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
          Tela 2 (Config)
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Em construção — a implementar na próxima seção.
        </p>

        {imageUrl && (
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-4">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              ✓ Imagem recebida da Tela 1:
            </p>
            <code className="text-xs text-zinc-600 dark:text-zinc-400 break-all">
              {imageUrl}
            </code>
          </div>
        )}

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Próxima seção implementará:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Tipo da roupa (dropdown)</li>
            <li>Tamanho (pills PP/P/M/G/GG)</li>
            <li>Preço (input com máscara R$)</li>
            <li>Estilo (dropdown)</li>
            <li>Descrição (textarea opcional)</li>
            <li>Botão "Gerar Imagem"</li>
          </ul>
        </div>

        <Link href="/" className="mt-auto">
          <Button type="button" variant="outline" className="w-full">
            ← Voltar pro Upload
          </Button>
        </Link>
      </div>
    </main>
  );
}
