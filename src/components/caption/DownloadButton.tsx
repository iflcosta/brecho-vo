/**
 * @spec docs/SPEC-SDD.md#tela-5-legenda
 * @description Botão de download que baixa imagem de URL externa via fetch + blob.
 * @author Mavis
 *
 * Estratégia: fetch(url) → blob → URL.createObjectURL → click anchor invisível.
 * Cloudinary libera CORS, então isso funciona sem proxy.
 * Fallback: se fetch falhar (CORS), abre URL em nova aba + instrução "long press".
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type DownloadButtonProps = {
  imageUrl: string;
  filename?: string;
  disabled?: boolean;
};

export function DownloadButton({
  imageUrl,
  filename = "brecho-post.jpg",
  disabled = false,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (!imageUrl) return;
    setLoading(true);
    setError(null);

    try {
      // Tenta fetch + blob
      const res = await fetch(imageUrl, { mode: "cors" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup do blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.warn("[download] fetch falhou, tentando nova aba:", err);
      // Fallback: abre em nova aba (mobile permite "long press → save image")
      try {
        window.open(imageUrl, "_blank", "noopener,noreferrer");
      } catch {
        setError("Não foi possível baixar. Tente abrir a imagem em nova aba.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        onClick={handleDownload}
        disabled={disabled || loading || !imageUrl}
        variant="outline"
        className="w-full"
      >
        {loading ? "Baixando..." : "📥 Baixar imagem"}
      </Button>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}