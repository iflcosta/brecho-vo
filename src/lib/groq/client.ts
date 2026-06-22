/**
 * @spec docs/SPEC-SDD.md#6.2-groq-legendas
 * @description Cliente Groq (LLM primário) + fallback multi-provider (Cerebras, OpenRouter)
 * @author Mavis
 */
import Groq from "groq-sdk";

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
  tone?: "casual" | "elegante" | "divertido";
};

/**
 * System prompt — copywriter de Instagram de brechó.
 * Define tom, formato, e regras de saída.
 */
const SYSTEM_PROMPT = `Você é um copywriter especialista em Instagram para brechós brasileiros.
Crie legendas curtas (máx 4 linhas), engajadoras, com emojis.
Tom amigável e convidativo, como se fosse uma vendedora querida.
Sempre inclua o preço destacado e hashtags relevantes.
Use linguagem natural, sem parecer robô.`;

/**
 * Gera legenda via Groq (primário).
 * Fallback para Cerebras e OpenRouter se Groq falhar (rate limit, 503, etc).
 */
export async function generateCaption(input: CaptionInput): Promise<string> {
  const userPrompt = `Crie uma legenda para:
- Peça: ${input.garmentType}
- Tamanho: ${input.size}
- Preço: ${input.price}
- Estilo: ${input.style}
- Descrição extra: ${input.description ?? "(nenhuma)"}

Hashtags padrão da loja: ${input.defaultHashtags}
Tom: ${input.tone ?? "casual"}`;

  // Provider primário: Groq
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_DEFAULT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });
    const text = completion.choices[0]?.message?.content;
    if (text) return text;
  } catch (err) {
    console.warn("[groq] falhou, tentando Cerebras:", err);
  }

  // TODO (Fase 1.1): implementar fallback Cerebras e OpenRouter
  // Por enquanto retorna mensagem amigável
  throw new Error("Todos os provedores de LLM falharam. Tente novamente em instantes.");
}
