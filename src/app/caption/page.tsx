/**
 * @spec docs/SPEC-SDD.md#tela-5-legenda
 * @description Tela 5 — Legenda. Última tela do fluxo.
 * @author Mavis
 *
 * Mudança 28/06: lê garmentTypes (array) OU garmentType (legado) do localStorage.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CaptionGenerator } from "@/components/caption/CaptionGenerator";
import { CaptionEditor } from "@/components/caption/CaptionEditor";
import { CaptionActions } from "@/components/caption/CaptionActions";
import { DownloadButton } from "@/components/caption/DownloadButton";
import { joinGarmentTypes } from "@/lib/schemas/config";

const FINAL_IMAGE_KEY = "brecho-final-image";
const PRODUCT_CONFIG_KEY = "brecho-product-config-v1";

type ProductConfig = {
  /** Novo: array de peças */
  garmentTypes?: string[];
  /** Legado: string único (mantido pra retrocompat) */
  garmentType?: string;
  size?: string;
  price?: string;
  style?: string;
  description?: string;
  defaultHashtags?: string;
};

export default function CaptionPage() {
  const router = useRouter();
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [payload, setPayload] = useState<{
    garmentTypes: string[];
    garmentType: string;
    size: string;
    price: string;
    style: string;
    description: string;
    defaultHashtags: string;
  } | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [missingImage, setMissingImage] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    try {
      const imageUrl = localStorage.getItem(FINAL_IMAGE_KEY);
      const configRaw = localStorage.getItem(PRODUCT_CONFIG_KEY);
      const config: ProductConfig = configRaw ? JSON.parse(configRaw) : {};

      if (!imageUrl) {
        setMissingImage(true);
        return;
      }

      // Resolve peças: array novo OU string legado OU "peça" placeholder
      const garmentTypes = Array.isArray(config.garmentTypes) && config.garmentTypes.length > 0
        ? config.garmentTypes
        : config.garmentType
        ? [config.garmentType]
        : ["peça"];
      const garmentType = joinGarmentTypes(garmentTypes);

      // Hashtags default: inclui pelo menos 1 tipo como hashtag
      const defaultHashtags = config.defaultHashtags ?? (
        "#brecho " + garmentTypes
          .filter((t) => t !== "Outro" && t !== "Acessório")
          .map((t) => "#" + t.toLowerCase().replace(/[^a-z0-9]/g, ""))
          .join(" ")
      );

      setFinalImageUrl(imageUrl);
      setPayload({
        garmentTypes,
        garmentType,
        size: config.size ?? "M",
        price: config.price ?? "R$ 0,00",
        style: config.style ?? "casual",
        description: config.description ?? "",
        defaultHashtags,
      });
    } catch (err) {
      console.error("[caption] erro ao carregar localStorage:", err);
      setMissingImage(true);
    }
  }, []);

  const handleComplete = useCallback(() => {
    setCompleted(true);
  }, []);

  const handleStartOver = useCallback(() => {
    try {
      localStorage.removeItem("brecho-original-image");
      localStorage.removeItem(PRODUCT_CONFIG_KEY);
      localStorage.removeItem("brecho-generated-image");
      localStorage.removeItem(FINAL_IMAGE_KEY);
    } catch {
      // ignore
    }
    router.push("/");
  }, [router]);

  if (missingImage) {
    return (
      <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <Link href="/compose" className="text-pink-600 dark:text-pink-400 text-2xl" aria-label="Voltar">
              ←
            </Link>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Legenda
            </h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
          <div className="text-center space-y-4">
            <div className="text-6xl">✍️</div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Falta a imagem composta
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Você precisa compor o texto na imagem antes de gerar a legenda.
              Volte pra etapa anterior.
            </p>
            <Link href="/compose" className="inline-block mt-4">
              <Button type="button">← Voltar pra Composição</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Link
            href="/compose"
            className="text-pink-600 dark:text-pink-400 text-2xl"
            aria-label="Voltar"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Legenda
          </h1>
          <span className="ml-auto text-xs text-zinc-500">Última etapa</span>
        </div>
      </header>

      <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-6 pb-32">
        {finalImageUrl && (
          <section aria-label="Preview final">
            <div className="rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={finalImageUrl}
                alt="Imagem final com texto sobreposto"
                className="w-full h-auto block"
                loading="lazy"
              />
            </div>
          </section>
        )}

        {payload && (
          <section aria-label="Gerador de legenda" className="space-y-4">
            <CaptionGenerator
              payload={payload}
              selectedCaption={caption}
              onSelectCaption={setCaption}
              onError={setError}
            />

            <CaptionEditor
              value={caption}
              onChange={setCaption}
            />

            <div className="space-y-2">
              <CaptionActions
                caption={caption}
                onClear={() => setCaption("")}
              />
              <DownloadButton
                imageUrl={finalImageUrl ?? ""}
                filename="brecho-post.jpg"
              />

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          </section>
        )}

        {completed && (
          <section
            aria-live="polite"
            className="p-4 bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-800 rounded-2xl text-center"
          >
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-1">
              Pronto pra postar!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Sua imagem está salva e a legenda está na área de transferência.
              Abra o Instagram e cole! ✨
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleStartOver}
              className="mt-2"
            >
              🔄 Fazer outro post
            </Button>
          </section>
        )}

        {!completed && caption && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleComplete}
            className="w-full text-pink-600 dark:text-pink-400"
          >
            ✓ Marcar como pronto
          </Button>
        )}
      </div>
    </main>
  );
}