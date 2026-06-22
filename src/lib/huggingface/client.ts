/**
 * @spec docs/SPEC-SDD.md#6.1-hugging-face-spaces-virtual-try-on
 * @description Cliente HF Spaces (VTON) via fetch HTTP direto pra API Gradio.
 * @author Mavis
 *
 * NOTA: HF Spaces tem latência alta (30-90s) e rate limit variável.
 * - MVP: usar com feature flag VTON_PROVIDER=hf (default)
 * - Upgrade pago: VTON_PROVIDER=fashn (ver FASHN_API_KEY no .env)
 *
 * IMPORTANTE: o client Python `gradio_client` não roda em Node.
 * Esta implementação usa a API HTTP do Gradio diretamente.
 * Refs: https://www.gradio.app/guides/querying-gradio-rest-api
 */

export type VTONInput = {
  /** URL da imagem do mannequin (uploaded) */
  mannequinImageUrl: string;
};

export type VTONResult = {
  /** URL da imagem gerada com modelo virtual */
  imageUrl: string;
  /** Tempo de processamento em ms */
  generationTime: number;
  /** Provider usado */
  provider: "hf" | "fashn";
};

const SPACES_FALLBACK_CHAIN = [
  "HumanAIGC/OutfitAnyone",
  "Kwai-Kolors/Kolors-Virtual-Try-On",
  "levihsu/OOTDiffusion",
] as const;

const HF_TIMEOUT_MS = 90_000; // 90s — VTON pode demorar

/**
 * Chama a API Gradio do HF Space via HTTP fetch.
 * Implementação simplificada — em produção, ajustar para a API específica
 * de cada Space (endpoints e parâmetros variam).
 */
async function callHFSpace(
  space: string,
  input: VTONInput
): Promise<string> {
  // TODO (Tela 3 — Geração): implementar chamada real.
  // Por enquanto retornamos a imagem original como placeholder.
  // Esta é uma decisão consciente: queremos o setup completo (estrutura,
  // schema, API routes, contexto) antes de mexer com VTON real.
  console.warn(`[vton] PLACEHOLDER: usando imagem original para Space ${space}`);
  return input.mannequinImageUrl;
}

/**
 * Tenta gerar imagem via HF Spaces (com fallback entre spaces).
 * Se VTON_PROVIDER=fashn, redireciona pra FASHN (a ser implementado).
 */
export async function tryOn(input: VTONInput): Promise<VTONResult> {
  const provider = process.env.VTON_PROVIDER ?? "hf";
  const start = Date.now();

  if (provider === "fashn") {
    // TODO (Fase 2): implementar FASHN API
    // Refs: docs/PESQUISA-VTON.md (provedor pago, $0.075/imagem)
    throw new Error("FASHN provider ainda não implementado. Use VTON_PROVIDER=hf no MVP.");
  }

  // Provider primário: HF Spaces com fallback chain
  let lastError: Error | null = null;
  for (const space of SPACES_FALLBACK_CHAIN) {
    try {
      const imageUrl = await callHFSpace(space, input);
      return {
        imageUrl,
        generationTime: Date.now() - start,
        provider: "hf",
      };
    } catch (err) {
      lastError = err as Error;
      console.warn(`[vton] Space ${space} falhou:`, err);
    }
  }

  throw new Error(
    `Todos os HF Spaces falharam. Último erro: ${lastError?.message ?? "desconhecido"}`
  );
}
