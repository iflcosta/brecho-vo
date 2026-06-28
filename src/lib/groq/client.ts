/**
 * @spec docs/SPEC-SDD.md#6.2-groq-legendas
 * @description Cliente Groq (LLM primário) + fallback multi-provider (Cerebras, OpenRouter).
 * @author Mavis
 *
 * Mudança 28/06: garmentType (string) → garmentTypes (array).
 * Suporta conjuntos (blusa + calça, etc).
 */
import Groq from "groq-sdk";
import type { CaptionTone } from "@/lib/schemas/caption";
import { joinGarmentTypes } from "@/lib/schemas/config";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "placeholder-not-configured",
});

export const GROQ_DEFAULT_MODEL = process.env.GROQ_MODEL ?? "qwen/qwen3-32b";

export type CaptionInput = {
  /** Array de tipos de peça (ex: ["Blusa", "Calça"]). vira "Blusa + Calça" no prompt. */
  garmentTypes: string[];
  /** Mantém garmentType como string derivada pra retrocompat. Opcional. */
  garmentType?: string;
  size: string;
  price: string;
  style: string;
  description?: string;
  defaultHashtags: string;
  tone?: CaptionTone;
};

/**
 * System prompt — copywriter de Instagram de brechó.
 */
const SYSTEM_PROMPT = `Você é um copywriter especialista em Instagram para brechós brasileiros.
Crie legendas curtas (máx 4 linhas / 600 caracteres), engajadoras, com 2-3 emojis no máximo.
Tom amigável e convidativo, como se fosse uma vendedora querida.
Sempre inclua o preço destacado e hashtags relevantes ao final.
Use linguagem natural, sem parecer robô. Nunca use aspas no início/fim.
Termine sempre com 3-5 hashtags relevantes separadas por espaço.`;

function buildUserPrompt(input: CaptionInput, variationHint?: number): string {
  const garment = input.garmentType ?? joinGarmentTypes(input.garmentTypes);
  const variationLine =
    variationHint !== undefined
      ? `\n\nEsta é a variação #${variationHint + 1} — crie uma versão com ângulo/ênfase diferente das anteriores.`
      : "";

  return `Crie uma legenda para:
- Peça: ${garment}
- Tamanho: ${input.size}
- Preço: ${input.price}
- Estilo: ${input.style}
- Descrição extra: ${input.description ?? "(nenhuma)"}

Hashtags sugeridas (use como base, mas pode adaptar): ${input.defaultHashtags}
Tom: ${input.tone ?? "casual"}${variationLine}`;
}

export async function generateCaption(input: CaptionInput): Promise<string> {
  const userPrompt = buildUserPrompt(input);

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

  throw new Error("Todos os provedores de LLM falharam. Tente novamente em instantes.");
}

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
      const garment = input.garmentType ?? joinGarmentTypes(input.garmentTypes);
      return null;
    })
  );

  const results = await Promise.all(promises);

  return results.map((text, i) => {
    if (text) return text;
    const garment = input.garmentType ?? joinGarmentTypes(input.garmentTypes);
    return `✨ ${garment} ${input.size} por ${input.price}! Variação #${i + 1} — tente gerar outra.`;
  });
}

export function extractHashtags(caption: string): string[] {
  return caption.match(/#[a-zA-Z0-9_]+/g) ?? [];
}