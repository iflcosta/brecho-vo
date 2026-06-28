/**
 * @spec docs/SPEC-SDD.md#tela-4-composicao
 * @description Schemas Zod pra configuração de composição (texto sobreposto).
 * @author Mavis
 */
import { z } from "zod";

/**
 * Posição do bloco de texto na imagem final.
 *  - bottom: rodapé centralizado (padrão pra posts de brechó)
 *  - top: topo centralizado
 *  - bottom_right: rodapé direito (estilo etiqueta de preço)
 */
export const COMPOSE_POSITIONS = ["bottom", "top", "bottom_right"] as const;
export type ComposePosition = (typeof COMPOSE_POSITIONS)[number];

/**
 * Schema do body POST /api/compose.
 * Recebe a config de texto + URL original do Cloudinary.
 */
export const composeRequestSchema = z.object({
  imageUrl: z
    .string()
    .url("URL da imagem inválida")
    .refine((url) => /res\.cloudinary\.com\//i.test(url), {
      message: "URL precisa ser do Cloudinary (overlay server-side)",
    }),
  size: z
    .string()
    .min(1, "Tamanho obrigatório")
    .max(8, "Tamanho muito longo"),
  price: z
    .string()
    .min(2, "Preço obrigatório (ex: R$ 45,00)")
    .max(20, "Preço muito longo"),
  hashtags: z
    .string()
    .max(120, "Hashtags muito longas (máx 120 caracteres)")
    .default(""),
  instagramHandle: z
    .string()
    .max(40, "Handle muito longo (máx 40 caracteres)")
    .regex(/^@?[a-zA-Z0-9._]+$/, "Handle inválido (use @ opcional + letras/números/._)")
    .default(""),
  position: z.enum(COMPOSE_POSITIONS).default("bottom"),
});

export type ComposeRequest = z.infer<typeof composeRequestSchema>;

/**
 * Schema dos inputs do form (client-side).
 * É mais permissivo que o request — permite campos vazios
 * que viram "" e são tratados no servidor.
 */
export const composeFormSchema = z.object({
  size: z.string().min(1, "Selecione um tamanho"),
  price: z
    .string()
    .min(1, "Digite o preço")
    .regex(/^R\$\s?\d+([,.]\d{1,2})?$/, "Formato inválido. Use R$ 45,00"),
  hashtags: z.string().max(120, "Máximo 120 caracteres").default(""),
  instagramHandle: z
    .string()
    .max(40, "Máximo 40 caracteres")
    .default(""),
  position: z.enum(COMPOSE_POSITIONS).default("bottom"),
});

export type ComposeFormValues = z.infer<typeof composeFormSchema>;