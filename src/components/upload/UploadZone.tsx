/**
 * @spec docs/SPEC-SDD.md#tela-1-upload
 * @description Componente de upload com drag&drop, validação e preview
 * @author Mavis
 */
"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type AllowedType = (typeof ALLOWED_TYPES)[number];

export type UploadZoneProps = {
  /** Callback quando arquivo é selecionado e validado (comprimido se necessário) */
  onFileSelected: (file: File, previewUrl: string) => void;
  /** Callback para mostrar erro de validação */
  onError?: (message: string) => void;
  /** Estado desabilitado durante upload */
  disabled?: boolean;
};

export function UploadZone({ onFileSelected, onError, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function validate(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type as AllowedType)) {
      return "Formato não suportado. Use JPG, PNG ou WebP.";
    }
    if (file.size > MAX_SIZE) {
      return "Arquivo muito grande. Máximo 10MB.";
    }
    return null;
  }

  function handleFile(file: File) {
    const err = validate(file);
    if (err) {
      onError?.(err);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    onFileSelected(file, previewUrl);
  }

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reseta o input pra permitir selecionar o mesmo arquivo de novo
    e.target.value = "";
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  return (
    <label
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex flex-col items-center justify-center",
        "w-full aspect-square max-w-sm mx-auto",
        "border-2 border-dashed rounded-2xl",
        "cursor-pointer transition-all",
        "text-center p-6",
        isDragging
          ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
          : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900",
        "hover:border-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-950/10",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInput}
        // capture="environment" → câmera traseira no mobile (mobile-first)
        // Em desktop o atributo é ignorado
        {...{ capture: "environment" }}
        disabled={disabled}
        className="sr-only"
      />
      <div className="text-6xl mb-4">📷</div>
      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        Toque para escolher foto
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        ou arraste aqui
      </p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
        JPG, PNG ou WebP • até 10MB
      </p>
    </label>
  );
}
