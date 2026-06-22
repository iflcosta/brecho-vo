/**
 * @spec docs/SPEC-SDD.md#tela-1-upload
 * @description Preview da imagem selecionada + botão de trocar
 * @author Mavis
 */
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export type UploadPreviewProps = {
  previewUrl: string;
  onReplace: () => void;
  disabled?: boolean;
};

export function UploadPreview({ previewUrl, onReplace, disabled }: UploadPreviewProps) {
  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-pink-200 dark:border-pink-900 bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={previewUrl}
          alt="Preview da foto selecionada"
          fill
          className="object-cover"
          unoptimized // blob URLs não passam pelo otimizador do Next
        />
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onReplace}
        disabled={disabled}
        className="w-full"
      >
        🔄 Trocar foto
      </Button>
    </div>
  );
}
