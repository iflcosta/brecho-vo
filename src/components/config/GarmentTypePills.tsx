/**
 * @spec docs/SPEC-SDD.md#tela-2-config
 * @description Componente multi-select de tipos de roupa.
 * Pills clicáveis que adicionam/removem peças do array.
 * Suporta conjuntos (blusa + calça, vestido + cinto, etc).
 * @author Mavis
 */
"use client";

import { cn } from "@/lib/utils";
import { GARMENT_TYPES } from "@/lib/schemas/config";

type GarmentTypePillsProps = {
  value: readonly string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  max?: number;
};

export function GarmentTypePills({
  value,
  onChange,
  error,
  disabled = false,
  max = 5,
}: GarmentTypePillsProps) {
  function toggle(type: string) {
    if (disabled) return;
    if (value.includes(type)) {
      onChange(value.filter((t) => t !== type));
    } else {
      if (value.length >= max) return;
      onChange([...value, type]);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de roupa (seleção múltipla)">
        {GARMENT_TYPES.map((type) => {
          const active = value.includes(type);
          const disabledItem = !active && value.length >= max;
          return (
            <button
              key={type}
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => toggle(type)}
              disabled={disabled || disabledItem}
              className={cn(
                "min-h-[44px] px-4 rounded-xl border-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
                active
                  ? "border-pink-600 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
                  : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300",
                (disabled || disabledItem) && "opacity-50 cursor-not-allowed"
              )}
            >
              {active && <span className="mr-1">✓</span>}
              {type}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        {value.length === 0
          ? "💡 Conjunto? Selecione mais de uma peça (ex: Blusa + Calça)"
          : `${value.length} peça${value.length > 1 ? "s" : ""} selecionada${value.length > 1 ? "s" : ""} (máx ${max})`}
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}