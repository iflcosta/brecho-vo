/**
 * @spec docs/SPEC-SDD.md#tela-2-config
 * @description Pills horizontais pra seleção de tamanho (PP/P/M/G/GG)
 * @author Mavis
 */
"use client";

import { SIZES } from "@/lib/schemas/config";
import { cn } from "@/lib/utils";

export type SizePillsProps = {
  value: string | undefined;
  onChange: (size: (typeof SIZES)[number]) => void;
  error?: string;
};

export function SizePills({ value, onChange, error }: SizePillsProps) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Tamanho"
        aria-invalid={!!error}
        className="grid grid-cols-5 gap-2"
      >
        {SIZES.map((size) => {
          const selected = value === size;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(size)}
              className={cn(
                "h-12 rounded-xl border-2 font-semibold text-base",
                "transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
                selected
                  ? "bg-pink-600 text-white border-pink-600 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-pink-300"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
