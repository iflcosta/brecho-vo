/**
 * @spec docs/SPEC-SDD.md#tela-2-config
 * @description Tela 2 — Form de configuração do produto
 * @author Mavis
 *
 * Fluxo:
 * 1. Usuário acabou de upar imagem na Tela 1 (localStorage "brecho-original-image")
 * 2. Aqui ele preenche tipo, tamanho, preço, estilo, descrição
 * 3. Submit salva no localStorage e navega pra /generate
 *
 * Critérios de aceite do SPEC atendidos em ConfigForm.tsx + SizePills.tsx
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ConfigForm } from "@/components/config/ConfigForm";

const IMAGE_STORAGE_KEY = "brecho-original-image";

export default function ConfigPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Carrega URL do localStorage (hidrata após mount pra evitar SSR mismatch)
  useEffect(() => {
    try {
      setImageUrl(localStorage.getItem(IMAGE_STORAGE_KEY));
    } catch {
      // localStorage indisponível
    }
    setHydrated(true);
  }, []);

  // Se não tem imagem, mostra aviso e link pra voltar
  if (hydrated && !imageUrl) {
    return (
      <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <Link href="/" className="text-pink-600 dark:text-pink-400 text-2xl" aria-label="Voltar">
              ←
            </Link>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Configuração
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
              Você precisa fazer upload de uma foto antes de configurar o produto.
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
      {/* Header com thumbnail sticky */}
      <header className="sticky top-0 z-10 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="text-pink-600 dark:text-pink-400 text-2xl flex-shrink-0"
            aria-label="Voltar pro upload"
          >
            ←
          </Link>
          {imageUrl && (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
              <Image
                src={imageUrl}
                alt="Miniatura da foto"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 truncate">
            Configuração
          </h1>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
            Sobre a peça
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Conta um pouco da roupa pra IA gerar a melhor imagem e legenda.
          </p>
        </div>

        {/* Mostra form só depois de hidratar pra evitar mismatch */}
        {hydrated && imageUrl && <ConfigForm imageUrl={imageUrl} />}
      </div>
    </main>
  );
}
