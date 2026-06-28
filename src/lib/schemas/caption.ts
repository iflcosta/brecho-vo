/**
 * @spec docs/SPEC-SDD.md#tela-5-legenda
 * @description Schemas Zod pra geração de legendas (Tela 5).
 * @author Mavis
 *
 * Mudança 28/06: aceita `garmentTypes` (array) OU `garmentType` (string legado).
 */
import { z } from "zod";

export const CAPTION_TONES = ["casual", "elegante", "divertido"] as const;
export type CaptionTone = (typeof CAPTION_TONES)[number];

/**
 * Schema do body POST /api/caption.
 */
export const captionRequestSchema = z.object({
  /** Array de tipos (preferido) — ex: ["Blusa", "Calça"] */
  garmentTypes: z.array(z.string().min(1)).min(1).max(5).optional(),
  /** String legado — concatenado. Mantido pra retrocompat com frontends antigos. */
  garmentType: z.string().min(1, "Tipo de peça obrigatório").optional(),
  size: z.string().min(1, "Tamanho obrigatório"),
  price: z.string().min(2, "Preço obrigatório"),
  style: z.string().min(1, "Estilo obrigatório"),
  description: z.string().max(500).optional(),
  tone: z.enum(CAPTION_TONES).default("casual"),
  defaultHashtags: z.string().max(200).default("#brecho #modasusada #brechoonline"),
  variationCount: z.number().int().min(1).max(5).default(1),
}).refine(
  (data) => data.garmentTypes !== undefined || data.garmentType !== undefined,
  { message: "Informe garmentTypes (array) ou garmentType (string)" }
);

export type CaptionRequest = z.infer<typeof captionRequestSchema>;

export const captionFormSchema = z.object({
  text: z
    .string()
    .min(10, "Legenda muito curta (mínimo 10 caracteres)")
    .max(2200, "Máximo 2200 caracteres (limite do Instagram)"),
});

export type CaptionFormValues = z.infer<typeof captionFormSchema>;