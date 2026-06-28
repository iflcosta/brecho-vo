/**
 * @spec docs/SPEC-SDD.md#tela-5-legenda
 * @description Botões de ação da legenda: "Copiar" e "Limpar".
 * Download fica em componente separado (DownloadButton).
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CaptionActionsProps = {
  caption: string;
  onClear?: () => void;
  disabled?: boolean;
};

export function CaptionActions({ caption, onClear, disabled = false }: CaptionActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!caption) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(caption);
      } else {
        // Fallback pra browsers antigos
        const ta = document.createElement("textarea");
        ta.value = caption;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[caption-actions] copy falhou:", err);
      alert("Não foi possível copiar. Selecione o texto manualmente.");
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={handleCopy}
        disabled={disabled || !caption}
        className="flex-1"
      >
        {copied ? "✓ Copiado!" : "📋 Copiar legenda"}
      </Button>
      {onClear && (
        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={disabled || !caption}
        >
          🗑️
        </Button>
      )}
    </div>
  );
}