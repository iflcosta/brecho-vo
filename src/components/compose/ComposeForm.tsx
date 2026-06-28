/**
 * @spec docs/SPEC-SDD.md#tela-4-composicao
 * @description Componente de formulário pra editar TAM, preço, hashtags e @ da loja.
 * @author Mavis
 *
 * Visual:
 *  - Inputs grandes (≥48px) — tia-friendly
 *  - Validação inline (Zod)
 *  - Auto-submit com debounce 400ms (atualiza preview enquanto digita)
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  composeFormSchema,
  type ComposeFormValues,
  type ComposePosition,
  COMPOSE_POSITIONS,
} from "@/lib/schemas/compose";

type ComposeFormProps = {
  initialValues: Partial<ComposeFormValues>;
  onChange: (values: ComposeFormValues) => void;
  onSubmit: (values: ComposeFormValues) => void;
  disabled?: boolean;
};

const POSITION_LABELS: Record<ComposePosition, string> = {
  bottom: "Rodapé",
  top: "Topo",
  bottom_right: "Rodapé direito",
};

export function ComposeForm({
  initialValues,
  onChange,
  onSubmit,
  disabled = false,
}: ComposeFormProps) {
  const [values, setValues] = useState<ComposeFormValues>({
    size: initialValues.size ?? "M",
    price: initialValues.price ?? "",
    hashtags: initialValues.hashtags ?? "",
    instagramHandle: initialValues.instagramHandle ?? "",
    position: initialValues.position ?? "bottom",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ComposeFormValues, string>>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-submit com debounce pra preview em tempo real
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const result = composeFormSchema.safeParse(values);
      if (result.success) {
        setErrors({});
        onChange(result.data);
      } else {
        const fieldErrors: Partial<Record<keyof ComposeFormValues, string>> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof ComposeFormValues;
          if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [values, onChange]);

  function update<K extends keyof ComposeFormValues>(key: K, value: ComposeFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = composeFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ComposeFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ComposeFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tamanho (size) — pills rápidos */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Tamanho
        </label>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Tamanho">
          {(["PP", "P", "M", "G", "GG"] as const).map((size) => {
            const active = values.size === size;
            return (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update("size", size)}
                disabled={disabled}
                className={`min-h-[48px] rounded-xl border-2 font-semibold transition-colors ${
                  active
                    ? "border-pink-600 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preço */}
      <div>
        <label
          htmlFor="compose-price"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Preço
        </label>
        <input
          id="compose-price"
          type="text"
          inputMode="decimal"
          placeholder="R$ 45,00"
          value={values.price}
          onChange={(e) => update("price", e.target.value)}
          disabled={disabled}
          aria-invalid={!!errors.price}
          aria-describedby={errors.price ? "compose-price-error" : undefined}
          className="w-full min-h-[48px] px-4 text-base rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:border-pink-600 focus:outline-none"
        />
        {errors.price && (
          <p id="compose-price-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.price}
          </p>
        )}
      </div>

      {/* Hashtags */}
      <div>
        <label
          htmlFor="compose-hashtags"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Hashtags <span className="text-zinc-400 text-xs">(opcional)</span>
        </label>
        <input
          id="compose-hashtags"
          type="text"
          placeholder="#brecho #modasusada"
          value={values.hashtags}
          onChange={(e) => update("hashtags", e.target.value)}
          disabled={disabled}
          maxLength={120}
          aria-invalid={!!errors.hashtags}
          className="w-full min-h-[48px] px-4 text-base rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:border-pink-600 focus:outline-none"
        />
        <p className="mt-1 text-xs text-zinc-500">{values.hashtags.length}/120</p>
      </div>

      {/* @ do Instagram */}
      <div>
        <label
          htmlFor="compose-handle"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          @ do Instagram <span className="text-zinc-400 text-xs">(opcional)</span>
        </label>
        <input
          id="compose-handle"
          type="text"
          placeholder="@brecho.mano"
          value={values.instagramHandle}
          onChange={(e) => update("instagramHandle", e.target.value)}
          disabled={disabled}
          maxLength={40}
          aria-invalid={!!errors.instagramHandle}
          className="w-full min-h-[48px] px-4 text-base rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:border-pink-600 focus:outline-none"
        />
      </div>

      {/* Posição */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Posição do texto
        </label>
        <div className="grid grid-cols-3 gap-2">
          {COMPOSE_POSITIONS.map((pos) => {
            const active = values.position === pos;
            return (
              <button
                key={pos}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update("position", pos)}
                disabled={disabled}
                className={`min-h-[48px] rounded-xl border-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-pink-600 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {POSITION_LABELS[pos]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botão oculto — preview é auto-update */}
      <Button type="submit" className="sr-only" aria-hidden="true" tabIndex={-1}>
        Atualizar
      </Button>
    </form>
  );
}