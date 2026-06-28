/**
 * @spec docs/SPEC-SDD.md#tela-5-legenda
 * @description Componente que gerencia a geração de variações de legenda.
 * Mostra botão "Gerar legenda" + lista de variações + textarea editável.
 * @author Mavis
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CaptionTone } from "@/lib/schemas/caption";

type CaptionGeneratorProps = {
  payload: {
    /** Array de tipos (preferido). Ex: ["Blusa", "Calça"] */
    garmentTypes?: string[];
    /** String legado concatenado. Ex: "Blusa + Calça" */
    garmentType?: string;
    size: string;
    price: string;
    style: string;
    description?: string;
    defaultHashtags: string;
  };
  selectedCaption: string;
  onSelectCaption: (caption: string) => void;
  onError?: (err: string) => void;
  disabled?: boolean;
};

const TONE_LABELS: Record<CaptionTone, string> = {
  casual: "😊 Casual",
  elegante: "✨ Elegante",
  divertido: "🎉 Divertido",
};

export function CaptionGenerator({
  payload,
  selectedCaption,
  onSelectCaption,
  onError,
  disabled = false,
}: CaptionGeneratorProps) {
  const [variations, setVariations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<CaptionTone>("casual");

  async function fetchCaptions(variationCount: number) {
    setLoading(true);
    onError?.("");
    try {
      const res = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          tone,
          variationCount,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Falha ao gerar legenda");
      }

      const newVariations: string[] = data.captions ?? [];
      setVariations((prev) => [...prev, ...newVariations]);
      // Seleciona a primeira nova variação se nada tava selecionado antes
      if (!selectedCaption && newVariations.length > 0) {
        onSelectCaption(newVariations[0]);
      } else if (newVariations.length > 0) {
        onSelectCaption(newVariations[0]);
      }
    } catch (err) {
      console.error("[caption] erro:", err);
      onError?.((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Tom */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Tom da legenda
        </label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tom">
          {(["casual", "elegante", "divertido"] as const).map((t) => {
            const active = tone === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTone(t)}
                disabled={disabled || loading}
                className={`min-h-[48px] rounded-xl border-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-pink-600 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {TONE_LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          onClick={() => fetchCaptions(1)}
          disabled={disabled || loading}
          className="flex-1"
        >
          {loading
            ? "Gerando..."
            : variations.length === 0
            ? "✨ Gerar legenda"
            : "🔄 Gerar outra"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => fetchCaptions(3)}
          disabled={disabled || loading}
          className="flex-1"
          aria-label="Gerar 3 variações de uma vez"
        >
          🎲 Gerar 3 variações
        </Button>
      </div>

      {/* Lista de variações anteriores (histórico) */}
      {variations.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Variações geradas ({variations.length}):
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {variations.map((v, i) => {
              const active = selectedCaption === v;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectCaption(v)}
                  className={`w-full text-left p-3 rounded-xl text-sm whitespace-pre-wrap border-2 transition-colors ${
                    active
                      ? "border-pink-600 bg-pink-50 dark:bg-pink-950/30 text-zinc-900 dark:text-zinc-50"
                      : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <span className="text-xs font-bold text-zinc-400 block mb-1">
                    Variação #{i + 1}
                  </span>
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}