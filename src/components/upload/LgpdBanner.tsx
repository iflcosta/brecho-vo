/**
 * @spec docs/SPEC-SDD.md#9.3-seguranca-lgpd
 * @description Banner de consentimento LGPD (RNF-09) — primeira vez que usuário abre
 * @author Mavis
 */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "brecho-lgpd-consent-v1";

export type LgpdBannerProps = {
  /** Se true, mostra o banner mesmo se já aceitou (pra testes) */
  forceShow?: boolean;
};

export function LgpdBanner({ forceShow = false }: LgpdBannerProps) {
  // null = carregando (não decidimos SSR), true = aceito, false = pendente
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    if (forceShow) {
      setAccepted(false);
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setAccepted(stored === "true");
    } catch {
      // localStorage indisponível (modo anônimo), mostra por segurança
      setAccepted(false);
    }
  }, [forceShow]);

  function handleAccept() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignora erro de storage
    }
    setAccepted(true);
  }

  // Carregando ou já aceito → não mostra
  if (accepted !== false) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="lgpd-title"
      aria-describedby="lgpd-desc"
      className="fixed inset-x-0 bottom-0 z-50 p-4 bg-white dark:bg-zinc-900 border-t-2 border-pink-500 shadow-2xl"
    >
      <div className="max-w-md mx-auto space-y-3">
        <h2
          id="lgpd-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          🔒 Antes de começar
        </h2>
        <p
          id="lgpd-desc"
          className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
        >
          Pra gerar seu post, a foto do manequim será enviada pra serviços de
          inteligência artificial (Hugging Face, Groq, Cloudinary). Elas são
          processadas <strong>apenas</strong> pra criar a imagem e a legenda do
          post — <strong>não</strong> são usadas pra treinar modelos nem
          compartilhadas com terceiros. As imagens podem ser deletadas em até
          24h.
        </p>
        <Button
          type="button"
          size="lg"
          onClick={handleAccept}
          className="w-full"
        >
          ✓ Entendi, pode continuar
        </Button>
      </div>
    </div>
  );
}
