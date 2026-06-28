/**
 * @spec docs/SPEC-SDD.md#tela-5-legenda
 * @description Textarea editável pra legenda.
 * Mostra contador de caracteres (limite Instagram = 2200).
 */
"use client";

import { useEffect, useState } from "react";
import { captionFormSchema } from "@/lib/schemas/caption";

const INSTAGRAM_MAX = 2200;

type CaptionEditorProps = {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
};

export function CaptionEditor({ value, onChange, disabled = false }: CaptionEditorProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = captionFormSchema.safeParse({ text: value });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(issue?.message ?? "Legenda inválida");
    } else {
      setError(null);
    }
  }, [value]);

  const charCount = value.length;
  const remaining = INSTAGRAM_MAX - charCount;
  const overLimit = remaining < 0;
  const warningLimit = remaining < 100;

  return (
    <div>
      <label
        htmlFor="caption-editor"
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
      >
        Sua legenda
      </label>
      <textarea
        id="caption-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="A legenda gerada aparecerá aqui. Edite como quiser!"
        rows={8}
        aria-invalid={!!error}
        aria-describedby={error ? "caption-error" : "caption-counter"}
        className={`w-full px-4 py-3 text-base rounded-xl border-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none resize-none ${
          overLimit
            ? "border-red-500 focus:border-red-600"
            : "border-zinc-200 dark:border-zinc-700 focus:border-pink-600"
        }`}
      />
      <div className="mt-1 flex items-center justify-between text-xs">
        <div>
          {error && (
            <p id="caption-error" className="text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
        <p
          id="caption-counter"
          className={
            overLimit
              ? "text-red-600 dark:text-red-400 font-medium"
              : warningLimit
              ? "text-orange-600 dark:text-orange-400"
              : "text-zinc-500"
          }
        >
          {charCount} / {INSTAGRAM_MAX}
        </p>
      </div>
    </div>
  );
}