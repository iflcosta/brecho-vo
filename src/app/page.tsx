/**
 * @spec docs/SPEC-SDD.md#tela-1-upload
 * @description Tela 1 — Upload da foto do manequim
 * @author Mavis
 *
 * Fluxo:
 * 1. LGPD banner aparece na primeira vez (consentimento)
 * 2. Usuário toca/arrasta a foto (UploadZone)
 * 3. Preview aparece (UploadPreview)
 * 4. Botão "Continuar" faz upload pro Cloudinary via /api/upload
 * 5. Em sucesso: persiste imageUrl no localStorage e navega pra /config
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { UploadZone } from "@/components/upload/UploadZone";
import { UploadPreview } from "@/components/upload/UploadPreview";
import { LgpdBanner } from "@/components/upload/LgpdBanner";
import { Button } from "@/components/ui/button";

type UploadState =
  | { phase: "idle" }
  | { phase: "selected"; file: File; previewUrl: string }
  | { phase: "uploading"; file: File; previewUrl: string }
  | { phase: "done"; imageUrl: string };

export default function HomePage() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>({ phase: "idle" });

  // Cleanup do blob URL quando o componente desmonta
  useEffect(() => {
    return () => {
      if (state.phase === "selected" || state.phase === "uploading") {
        URL.revokeObjectURL(state.previewUrl);
      }
    };
  }, [state]);

  function handleFileSelected(file: File, previewUrl: string) {
    // Substitui state anterior e libera o blob anterior (se houver)
    setState((prev) => {
      if (prev.phase === "selected" || prev.phase === "uploading") {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return { phase: "selected", file, previewUrl };
    });
  }

  function handleReplace() {
    setState((prev) => {
      if (prev.phase === "selected" || prev.phase === "uploading") {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return { phase: "idle" };
    });
  }

  async function handleContinue() {
    if (state.phase !== "selected") return;
    setState({ phase: "uploading", file: state.file, previewUrl: state.previewUrl });

    try {
      const formData = new FormData();
      formData.append("file", state.file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Erro no upload");
      }

      // Persiste no localStorage pra Tela 2 usar
      try {
        localStorage.setItem("brecho-original-image", data.url);
      } catch {
        // ignora erro de storage (modo anônimo)
      }

      toast.success("Foto enviada!");
      setState({ phase: "done", imageUrl: data.url });
      router.push("/config");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro no upload";
      toast.error(message);
      setState({ phase: "selected", file: state.file, previewUrl: state.previewUrl });
    }
  }

  const isUploading = state.phase === "uploading";
  const isSelected = state.phase === "selected" || state.phase === "uploading";

  return (
    <>
      <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        {/* Header */}
        <header className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Brechó da Vovó
            </h1>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
            Foto do manequim
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Vamos transformar a foto da roupa em um post pro Instagram.
          </p>

          {/* Conteúdo principal: upload ou preview */}
          <div className="flex-1 flex items-start justify-center">
            {isSelected ? (
              <UploadPreview
                previewUrl={state.previewUrl}
                onReplace={handleReplace}
                disabled={isUploading}
              />
            ) : (
              <UploadZone
                onFileSelected={handleFileSelected}
                onError={(msg) => toast.error(msg)}
                disabled={isUploading}
              />
            )}
          </div>

          {/* Dica (só quando idle) */}
          {state.phase === "idle" && (
            <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 mt-4">
              💡 Foto do manequim com boa luz e fundo simples funciona melhor!
            </p>
          )}

          {/* Botão Continuar (só quando selecionado) */}
          {isSelected && (
            <div className="mt-6">
              <Button
                type="button"
                size="lg"
                onClick={handleContinue}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>Continuar →</>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>

      <LgpdBanner />
      <Toaster position="top-center" richColors />
    </>
  );
}
