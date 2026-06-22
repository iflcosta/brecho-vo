/**
 * @spec docs/SPEC-SDD.md#tela-3-geracao
 * @description Hook que orquestra o job VTON: chama POST, faz polling do status
 * @author Mavis
 *
 * Fluxo:
 * 1. start() → POST /api/tryon com imageUrl
 * 2. API retorna { generationId } (status "processing")
 * 3. Hook faz polling GET /api/tryon?id=... a cada 3s
 * 4. Quando status = "done" → retorna imageUrl
 * 5. Quando status = "failed" → retorna error
 * 6. Timeout: 90s (VTON pode demorar 30-90s + folga)
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TryOnPhase = "idle" | "submitting" | "polling" | "done" | "failed";

type TryOnResult = {
  imageUrl: string;
  generationId: string;
  generationTime: number;
};

type TryOnError = {
  code: "VTON_SERVICE_ERROR" | "TIMEOUT" | "NETWORK";
  message: string;
};

export type UseTryOnReturn = {
  phase: TryOnPhase;
  result: TryOnResult | null;
  error: TryOnError | null;
  /** Tempo decorrido em segundos desde start() */
  elapsedSeconds: number;
  /** Inicia (ou reinicia) o job */
  start: (mannequinImageUrl: string) => Promise<void>;
  /** Reseta o estado pra idle */
  reset: () => void;
};

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 90_000;

export function useTryOn(): UseTryOnReturn {
  const [phase, setPhase] = useState<TryOnPhase>("idle");
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [error, setError] = useState<TryOnError | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tick, setTick] = useState(0);

  const startedAtRef = useRef<number | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Timer de elapsed (atualiza a cada 1s quando rodando)
  useEffect(() => {
    if (phase !== "submitting" && phase !== "polling") return;
    const interval = setInterval(() => {
      if (startedAtRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, tick]);

  const poll = useCallback(async (generationId: string) => {
    try {
      const res = await fetch(`/api/tryon?id=${encodeURIComponent(generationId)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Erro ao consultar status");
      }

      if (data.status === "done") {
        setResult({
          imageUrl: data.imageUrl,
          generationId,
          generationTime: elapsedSeconds,
        });
        setPhase("done");
        return;
      }
      if (data.status === "failed") {
        setError({
          code: "VTON_SERVICE_ERROR",
          message: data.error ?? "Falha na geração. Tente novamente.",
        });
        setPhase("failed");
        return;
      }

      // Ainda processando — verifica timeout
      if (startedAtRef.current && Date.now() - startedAtRef.current > TIMEOUT_MS) {
        setError({
          code: "TIMEOUT",
          message: "A geração demorou mais que 90 segundos. Tente novamente.",
        });
        setPhase("failed");
        return;
      }

      // Continua polling
      pollTimeoutRef.current = setTimeout(() => poll(generationId), POLL_INTERVAL_MS);
    } catch (err) {
      // Network error
      const message = err instanceof Error ? err.message : "Erro de rede";
      setError({ code: "NETWORK", message });
      setPhase("failed");
    }
  }, [elapsedSeconds]);

  const start = useCallback(async (mannequinImageUrl: string) => {
    // Reset
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    if (abortRef.current) abortRef.current.abort();
    setResult(null);
    setError(null);
    setElapsedSeconds(0);
    startedAtRef.current = Date.now();
    setPhase("submitting");
    setTick((t) => t + 1);

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mannequinImageUrl }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Erro ao iniciar geração");
      }

      // Começa polling
      setPhase("polling");
      setTick((t) => t + 1);
      poll(data.generationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro de rede";
      setError({ code: "NETWORK", message });
      setPhase("failed");
    }
  }, [poll]);

  const reset = useCallback(() => {
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    if (abortRef.current) abortRef.current.abort();
    setResult(null);
    setError(null);
    setElapsedSeconds(0);
    setPhase("idle");
    startedAtRef.current = null;
  }, []);

  return { phase, result, error, elapsedSeconds, start, reset };
}
