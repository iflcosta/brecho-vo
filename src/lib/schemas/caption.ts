/**
 * @spec docs/SPEC-SDD.md#tela-5-legenda
 * @description Schemas Zod pra geração de legendas (Tela 5).
 * @author Mavis
 */
import { z } from "zod";

export const CAPTION_TONES = ["casual", "elegante", "divertido"] as const;
export type CaptionTone = (typeof CAPTION_TONES)[number];

/**
 * Schema do body POST /api/caption.
 * Aceita a config da Tela 2 + tom opcional.
 */
export const captionRequestSchema = z.object({
  garmentType: z.string().min(1, "Tipo de peça obrigatório"),
  size: z.string().min(1, "Tamanho obrigatório"),
  price: z.string().min(2, "Preço obrigatório"),
  style: z.string().min(1, "Estilo obrigatório"),
  description: z.string().max(500).optional(),
  tone: z.enum(CAPTION_TONES).default("casual"),
  defaultHashtags: z
    .string()
    .max(200)
    .default("#brecho #modasusada #brechoonline"),
  /** Quantas variações gerar (1-5). Default 1. */
  variationCount: z
    .number()
    .int()
    .min(1, "Mínimo 1 variação")
    .max(5, "Máximo 5 variações por vez")
    .default(1),
});

export type CaptionRequest = z.infer<typeof captionRequestSchema>;

/**
 * Schema do form do CaptionEditor (textarea).
 */
export const captionFormSchema = z.object({
  text: z
    .string()
    .min(10, "Legenda muito curta (mínimo 10 caracteres)")
    .max(2200, "Máximo 2200 caracteres (limite do Instagram)"),
});

export type CaptionFormValues = z.infer<typeof captionFormSchema>;