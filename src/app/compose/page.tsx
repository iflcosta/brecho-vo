/**
 * @spec docs/SPEC-SDD.md#tela-4-composicao
 * @description Tela 4 — Composição de texto na imagem (Cloudinary server-side overlay).
 * @author Mavis
 *
 * Fluxo:
 *  1. Carrega `generatedImageUrl` (Cloudinary) do localStorage
 *  2. Carrega `productConfig` (Tela 2) do localStorage pra preencher form
 *  3. Renderiza form (TAM, preço, hashtags, @loja, posição)
 *  4. Auto-chama POST /api/compose conforme form muda (debounce 400ms)
 *  5. Preview mostra imagem composta
 *  6. Botão "Avançar" persiste finalImageUrl no localStorage + navega pra /caption
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ComposeForm } from "@/components/compose/ComposeForm";
import { ComposedPreview } from "@/components/compose/ComposedPreview";
import type { ComposeFormValues } from "@/lib/schemas/compose";

// localStorage keys (consistentes com as outras telas)
const GENERATED_STORAGE_KEY = "brecho-generated-image";
const PRODUCT_CONFIG_KEY = "brecho-product-config-v1";
const FINAL_IMAGE_KEY = "brecho-final-image";

type ProductConfig = {
  garmentType?: string;
  size?: string;
  price?: string;
  style?: string;
  description?: string;
  instagramHandle?: string;
};

export default function ComposePage() {
  const router = useRouter();
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<Partial<ComposeFormValues>>({});
  const [composedUrl, setComposedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingImage, setMissingImage] = useState(false);

  // Carrega dependências do localStorage
  useEffect(() => {
    try {
      const url = localStorage.getItem(GENERATED_STORAGE_KEY);
      const configRaw = localStorage.getItem(PRODUCT_CONFIG_KEY);
      const config: ProductConfig = configRaw ? JSON.parse(configRaw) : {};

      if (!url) {
        setMissingImage(true);
        return;
      }

      setGeneratedImageUrl(url);
      setInitialValues({
        size: config.size ?? "M",
        price: config.price ?? "",
        hashtags: `#brecho #${(config.garmentType ?? "moda").toLowerCase()}`,
        instagramHandle: config.instagramHandle ?? "",
        position: "bottom",
      });
    } catch (err) {
      console.error("[compose] erro ao carregar localStorage:", err);
      setMissingImage(true);
    }
  }, []);

  // Handler chamado pelo ComposeForm com debounce (400ms)
  const handleFormChange = useCallback(
    async (values: ComposeFormValues) => {
      if (!generatedImageUrl) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/compose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: generatedImageUrl,
            size: values.size,
            price: values.price,
            hashtags: values.hashtags,
            instagramHandle: values.instagramHandle,
            position: values.position,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error ?? "Falha ao gerar preview");
        }

        setComposedUrl(data.composedUrl);
      } catch (err) {
        console.error("[compose] erro:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [generatedImageUrl]
  );

  const handleSubmit = useCallback(
    (values: ComposeFormValues) => {
      // Submete sem debounce pra confirmar final
      handleFormChange(values);
    },
    [handleFormChange]
  );

  const handleAdvance = useCallback(() => {
    if (!composedUrl) return;
    try {
      localStorage.setItem(FINAL_IMAGE_KEY, composedUrl);
      router.push("/caption");
    } catch (err) {
      console.error("[compose] erro ao salvar:", err);
      setError("Não conseguiu salvar. Tente novamente.");
    }
  }, [composedUrl, router]);

  // Estado vazio: imagem gerada não foi encontrada (tia pulou Tela 3)
  if (missingImage) {
    return (
      <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <Link href="/generate" className="text-pink-600 dark:text-pink-400 text-2xl" aria-label="Voltar">
              ←
            </Link>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Composição
            </h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
          <div className="text-center space-y-4">
            <div className="text-6xl">🖼️</div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Falta a imagem gerada
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Você precisa gerar a modelo virtual antes de compor o texto.
              Volte pra etapa anterior.
            </p>
            <Link href="/generate" className="inline-block mt-4">
              <Button type="button">← Voltar pra Geração</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Link
            href="/generate"
            className="text-pink-600 dark:text-pink-400 text-2xl"
            aria-label="Voltar"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Compor texto
          </h1>
        </div>
      </header>

      <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-6 pb-32">
        {/* Preview no topo (mobile-first) */}
        <section aria-label="Preview">
          <ComposedPreview
            composedUrl={composedUrl}
            loading={loading}
            error={error}
            onRetry={() => {
              if (generatedImageUrl) {
                setLoading(true);
                fetch("/api/compose", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    imageUrl: generatedImageUrl,
                    ...initialValues,
                  }),
                })
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.success) setComposedUrl(d.composedUrl);
                    else setError(d.error);
                  })
                  .catch((e) => setError(e.message))
                  .finally(() => setLoading(false));
              }
            }}
          />
        </section>

        {/* Form */}
        <section aria-label="Configuração do texto">
          <ComposeForm
            initialValues={initialValues}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        </section>
      </div>

      {/* Footer fixo com botão Avançar */}
      <footer className="sticky bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-md mx-auto">
          <Button
            type="button"
            onClick={handleAdvance}
            disabled={!composedUrl || loading}
            className="w-full"
          >
            {loading ? "Aplicando..." : "Avançar pra Legenda →"}
          </Button>
          {composedUrl && !loading && (
            <p className="mt-2 text-xs text-center text-zinc-500">
              O texto será aplicado na imagem ao baixar
            </p>
          )}
        </div>
      </footer>
    </main>
  );
}