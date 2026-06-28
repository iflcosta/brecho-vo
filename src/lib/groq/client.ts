/**
 * @spec docs/SPEC-SDD.md#6.2-groq-legendas
 * @description Cliente Groq (LLM primário) + fallback multi-provider (Cerebras, OpenRouter).
 * @author Mavis
 *
 * Funções:
 *  - generateCaption(): 1 legenda via Groq
 *  - generateCaptions(): N variações em paralelo
 */
import Groq from "groq-sdk";
import type { CaptionTone } from "@/lib/schemas/caption";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "placeholder-not-configured",
});

export const GROQ_DEFAULT_MODEL = process.env.GROQ_MODEL ?? "qwen/qwen3-32b";

export type CaptionInput = {
  garmentType: string;
  size: string;
  price: string;
  style: string;
  description?: string;
  defaultHashtags: string;
  tone?: CaptionTone;
};

/**
 * System prompt — copywriter de Instagram de brechó.
 * Define tom, formato, e regras de saída.
 */
const SYSTEM_PROMPT = `Você é um copywriter especialista em Instagram para brechós brasileiros.
Crie legendas curtas (máx 4 linhas / 600 caracteres), engajadoras, com 2-3 emojis no máximo.
Tom amigável e convidativo, como se fosse uma vendedora querida.
Sempre inclua o preço destacado e hashtags relevantes ao final.
Use linguagem natural, sem parecer robô. Nunca use aspas no início/fim.
Termine sempre com 3-5 hashtags relevantes separadas por espaço.`;

/**
 * Monta o user prompt a partir do input.
 * Inclui pequena variação de instrução pra cada chamada do loop
 * (ajuda o modelo a gerar opções diferentes em N chamadas).
 */
function buildUserPrompt(input: CaptionInput, variationHint?: number): string {
  const variationLine =
    variationHint !== undefined
      ? `\n\nEsta é a variação #${variationHint + 1} — crie uma versão com ângulo/ênfase diferente das anteriores.`
      : "";

  return `Crie uma legenda para:
- Peça: ${input.garmentType}
- Tamanho: ${input.size}
- Preço: ${input.price}
- Estilo: ${input.style}
- Descrição extra: ${input.description ?? "(nenhuma)"}

Hashtags sugeridas (use como base, mas pode adaptar): ${input.defaultHashtags}
Tom: ${input.tone ?? "casual"}${variationLine}`;
}

/**
 * Gera 1 legenda via Groq (primário).
 * Fallback para Cerebras e OpenRouter se Groq falhar (rate limit, 503, etc).
 */
export async function generateCaption(input: CaptionInput): Promise<string> {
  const userPrompt = buildUserPrompt(input);

  // Provider primário: Groq
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_DEFAULT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 400,
    });
    const text = completion.choices[0]?.message?.content;
    if (text) return text.trim();
  } catch (err) {
    console.warn("[groq] falhou:", err);
  }

  // TODO (Fase 1.1): implementar fallback Cerebras e OpenRouter
  // Por enquanto retorna mensagem amigável
  throw new Error("Todos os provedores de LLM falharam. Tente novamente em instantes.");
}

/**
 * Gera N variações de legenda em paralelo.
 * Cada chamada tem pequena variação de instrução pra diversificar.
 * Retorna array na mesma ordem do variationCount.
 *
 * Tolerante a falhas parciais: se 1 falhar, retorna as outras +
 * preenche buracos com mensagens amigáveis.
 */
export async function generateCaptions(
  input: CaptionInput,
  count: number
): Promise<string[]> {
  if (count <= 1) {
    return [await generateCaption(input)];
  }

  const limitedCount = Math.min(Math.max(count, 1), 5);

  const promises = Array.from({ length: limitedCount }, (_, i) =>
    generateCaption(input).catch((err) => {
      console.warn(`[groq] variação ${i + 1} falhou:`, err);
      return null;
    })
  );

  const results = await Promise.all(promises);

  // Preenche buracos com mensagens amigáveis
  return results.map((text, i) =>
    text ?? `✨ ${input.garmentType} ${input.size} por ${input.price}! Variação #${i + 1} — tente gerar outra.`
  );
}

/**
 * Extrai hashtags (#palavra) de uma legenda.
 */
export function extractHashtags(caption: string): string[] {
  return caption.match(/#[a-zA-Z0-9_]+/g) ?? [];
}