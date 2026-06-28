/**
 * @spec docs/SPEC-SDD.md#6.1-hugging-face-spaces-virtual-try-on
 * @description Cliente HF Spaces (VTON) via fetch HTTP direto pra API Gradio.
 * @author Mavis
 *
 * Estratégia (MVP, zero-budget):
 *  - Primary: Kwai-Kolors/Kolors-Virtual-Try-On (mais estável em 2026, free)
 *  - Fallback 1: HumanAIGC/OutfitAnyone
 *  - Fallback 2: levihsu/OOTDiffusion
 *
 * Protocolo Gradio HTTP (sem SDK Python):
 *  1. POST /gradio_api/queue/join com { data, fn_index, session_hash }
 *  2. Recebe { event_id }
 *  3. Polling em /gradio_api/queue/data?session_hash=... (SSE)
 *  4. Espera status "process_completed" → parse output
 *
 * Cold-start: HF Spaces pode demorar 30-60s no primeiro request.
 * Timeout total: 90s por Space, fallback automático no próximo.
 *
 * IMPORTANTE: client Python `gradio_client` não roda em Node.
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
  /** Space que efetivamente gerou (caso tenha usado fallback) */
  space?: string;
};

type SpaceConfig = {
  /** Nome do Space (formato "owner/name") */
  name: string;
  /** Subdomínio (formato "owner-name") */
  subdomain: string;
  /** Índice da função Gradio (geralmente 0) */
  fnIndex: number;
  /** Nome descritivo pra logs */
  label: string;
};

/**
 * Chain de fallback: tenta primary primeiro, depois fallback1, fallback2.
 * Cada Space tem API específica — configuramos os principais.
 */
const SPACES_FALLBACK_CHAIN: SpaceConfig[] = [
  {
    name: "Kwai-Kolors/Kolors-Virtual-Try-On",
    subdomain: "Kwai-Kolors-Kolors-Virtual-Try-On",
    fnIndex: 0,
    label: "Kolors VTON",
  },
  {
    name: "HumanAIGC/OutfitAnyone",
    subdomain: "HumanAIGC-OutfitAnyone",
    fnIndex: 0,
    label: "OutfitAnyone",
  },
  {
    name: "levihsu/OOTDiffusion",
    subdomain: "levihsu-OOTDiffusion",
    fnIndex: 0,
    label: "OOTDiffusion",
  },
];

const HF_TIMEOUT_MS = 90_000; // 90s por Space (incluindo cold-start)
const POLL_INTERVAL_MS = 3_000;

/**
 * Faz uma chamada HTTP ao HF Space e retorna a URL da imagem gerada.
 *
 * Implementação detalhada abaixo.
 */
async function callHFSpace(
  space: SpaceConfig,
  input: VTONInput
): Promise<string> {
  const baseUrl = `https://${space.subdomain}.hf.space`;
  const sessionHash = crypto.randomUUID();
  const start = Date.now();

  console.log(`[vton] ${space.label}: iniciando (cold-start pode levar 30-60s)...`);

  // 1. POST /gradio_api/queue/join — submete o job
  const joinUrl = `${baseUrl}/gradio_api/queue/join`;
  // Para Spaces de VTON, a entrada típica é:
  //   [mannequin_image, garment_description, ...other params]
  // Como a tia envia FOTO DO MANEQUIM VESTINDO A ROUPA (não a roupa separada),
  // mandamos a imagem + descrição opcional derivada do config da Tela 2.
  const data: unknown[] = [input.mannequinImageUrl];

  const joinRes = await fetch(joinUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data,
      fn_index: space.fnIndex,
      session_hash: sessionHash,
      trigger_id: space.fnIndex,
    }),
  });

  if (!joinRes.ok) {
    const errText = await joinRes.text().catch(() => "");
    throw new Error(
      `HTTP ${joinRes.status} ao submeter job em ${space.label}: ${errText.slice(0, 200)}`
    );
  }

  // 2. Poll /gradio_api/queue/data?session_hash=... até process_completed
  const dataUrl = `${baseUrl}/gradio_api/queue/data?session_hash=${sessionHash}`;
  const dataRes = await fetch(dataUrl, {
    headers: { Accept: "text/event-stream" },
  });

  if (!dataRes.ok || !dataRes.body) {
    throw new Error(
      `HTTP ${dataRes.status} ao poll status em ${space.label}`
    );
  }

  // Lê SSE chunks
  const reader = dataRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      // Timeout global por Space
      if (Date.now() - start > HF_TIMEOUT_MS) {
        throw new Error(`Timeout de ${HF_TIMEOUT_MS / 1000}s em ${space.label}`);
      }

      // Race: lê próximo chunk OU espera poll interval
      const readPromise = reader.read();
      const timeoutPromise = new Promise<{ done: boolean; value?: undefined }>((resolve) => {
        setTimeout(() => resolve({ done: false }), POLL_INTERVAL_MS);
      });

      const result = await Promise.race([
        readPromise,
        timeoutPromise.then(() => ({ done: false as const, value: undefined as unknown as Uint8Array })),
      ]);

      if (result.done && !("value" in result && result.value)) {
        // Stream encerrou sem completed
        throw new Error(`Stream encerrou prematuramente em ${space.label}`);
      }

      if (result.value) {
        buffer += decoder.decode(result.value, { stream: true });
        // SSE messages são separadas por "\n\n"
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const parsed = parseSSEEvent(event);
          if (!parsed) continue;

          // { msg: "process_completed", output: { data: [...] } }
          if (parsed.msg === "process_completed") {
            const output = (parsed as { output?: { data?: unknown[] } }).output;
            const outputData = output?.data;
            if (!outputData || !Array.isArray(outputData) || outputData.length === 0) {
              throw new Error(`Output vazio de ${space.label}`);
            }
            // Output[0] geralmente é { type: "image", value: { url: "..." } } ou similar
            // Varia por Space — extração genérica abaixo.
            const url = extractImageUrlFromOutput(outputData);
            if (!url) {
              throw new Error(
                `Não foi possível extrair URL da imagem do output de ${space.label}`
              );
            }
            console.log(`[vton] ${space.label}: concluído em ${Date.now() - start}ms`);
            return url;
          }

          if (parsed.msg === "process_failed") {
            const errMsg =
              (parsed as { output?: { error?: string } }).output?.error ??
              "Falha desconhecida";
            throw new Error(`${space.label} falhou: ${errMsg}`);
          }

          if (parsed.msg === "estimation" || parsed.msg === "progress") {
            // Ainda processando — segue o loop
            continue;
          }
        }
      }

      // Pequeno sleep pra não martelar o Space
      await sleep(500);
    }
  } finally {
    // Cleanup: cancela o reader
    try {
      await reader.cancel();
    } catch {
      // ignora erro de cancelamento
    }
  }
}

/**
 * Parseia um evento SSE do Gradio.
 * Formato:
 *   event: <event_type>
 *   data: <json>
 */
function parseSSEEvent(event: string): Record<string, unknown> | null {
  const lines = event.split("\n");
  let dataLine = "";
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      dataLine = line.slice("data: ".length);
    } else if (line.startsWith("data:")) {
      dataLine = line.slice("data:".length).trim();
    }
  }
  if (!dataLine) return null;
  try {
    return JSON.parse(dataLine) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Extrai URL da imagem do output do Gradio.
 * Varia por Space, então tenta vários formatos comuns:
 *   - { image: { url: "https://..." } } (Kolors-style)
 *   - { type: "image", value: "data:image/..." } (Gradio file-style)
 *   - "https://..." string puro
 *   - "data:image/...;base64,..." string base64
 */
function extractImageUrlFromOutput(output: unknown[]): string | null {
  for (const item of output) {
    if (typeof item === "string") {
      if (item.startsWith("http") || item.startsWith("data:image/")) {
        return item;
      }
    }
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      // Formato { image: { url: "..." } }
      if (obj.image && typeof obj.image === "object") {
        const imgObj = obj.image as Record<string, unknown>;
        if (typeof imgObj.url === "string") return imgObj.url;
      }
      // Formato { url: "..." }
      if (typeof obj.url === "string") return obj.url;
      // Formato { type: "image", value: "..." }
      if (obj.type === "image" && typeof obj.value === "string") return obj.value;
      // Formato { path: "...", url: "..." } (Gradio file component)
      if (typeof obj.path === "string" && obj.path.startsWith("http")) {
        return obj.path;
      }
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
        space: space.name,
      };
    } catch (err) {
      lastError = err as Error;
      console.warn(`[vton] Space ${space.label} falhou:`, err);
      // Continua pro próximo Space
    }
  }

  throw new Error(
    `Todos os HF Spaces falharam. Último erro: ${lastError?.message ?? "desconhecido"}`
  );
}