/**
 * @spec docs/SPEC-SDD.md#tela-2-config
 * @description Schema Zod + types compartilhados do formulário de configuração
 * @author Mavis
 *
 * Mudança 28/06: `garmentType` (string único) → `garmentTypes` (array, min 1, max 5).
 * Necessário pra suportar conjuntos (blusa + calça, vestido + cinto, etc).
 *
 * Mantém `garmentType` (string derivado) pra retrocompat com consumidores
 * que ainda esperam 1 valor (ex: caption legada, debug).
 */
import { z } from "zod";

// ============================================================================
// Enums (listas fixas do SPEC — mantenha sincronizado com /api/caption)
// ============================================================================

/** Tipos de roupa que a tia pode anunciar. Pode selecionar 1+ (conjunto). */
export const GARMENT_TYPES = [
  "Camisa",
  "Camiseta",
  "Vestido",
  "Calça",
  "Saia",
  "Blusa",
  "Casaco",
  "Jaqueta",
  "Shorts",
  "Conjunto",
  "Acessório",
  "Outro",
] as const;

/** Tamanhos disponíveis (BR) */
export const SIZES = ["PP", "P", "M", "G", "GG"] as const;

/** Estilos que combinam com brechó vintage/moderno */
export const STYLES = [
  "Vintage",
  "Modernos",
  "Anos 90",
  "Y2K",
  "Minimalista",
  "Boêmio",
  "Esportivo",
  "Streetwear",
] as const;

// ============================================================================
// Schema Zod (API + form)
// ============================================================================

/**
 * Schema da config completa do produto (usado pela API e pelo localStorage).
 * `garmentTypes` é array — múltiplas peças (ex: conjunto).
 */
export const productConfigSchema = z.object({
  garmentTypes: z
    .array(z.enum(GARMENT_TYPES))
    .min(1, "Selecione pelo menos uma peça")
    .max(5, "Máximo 5 peças por post"),
  size: z.enum(SIZES, {
    message: "Selecione o tamanho",
  }),
  /** Preço em reais (número). Ex: 45.00 = R$ 45,00 */
  price: z
    .number({ message: "Informe o preço" })
    .positive("O preço deve ser maior que zero")
    .max(100000, "Valor muito alto")
    .multipleOf(0.01, "Use até 2 casas decimais"),
  style: z.enum(STYLES, {
    message: "Selecione o estilo",
  }),
  description: z
    .string()
    .max(500, "Descrição muito longa (máx 500 caracteres)")
    .optional()
    .or(z.literal("")),
});

/** Tipo inferido do schema (single source of truth) */
export type ProductConfig = z.infer<typeof productConfigSchema>;

/**
 * Versão do schema para o form (price como string, antes do parse).
 */
export const productConfigFormSchema = z.object({
  garmentTypes: z
    .array(z.enum(GARMENT_TYPES))
    .min(1, "Selecione pelo menos uma peça")
    .max(5, "Máximo 5 peças por post"),
  size: z.enum(SIZES, {
    message: "Selecione o tamanho",
  }),
  price: z
    .string()
    .min(1, "Informe o preço")
    .refine(
      (val) => {
        const clean = val.replace(/\D/g, "");
        const num = Number(clean) / 100;
        return !Number.isNaN(num) && num > 0;
      },
      { message: "O preço deve ser maior que zero" }
    ),
  style: z.enum(STYLES, {
    message: "Selecione o estilo",
  }),
  description: z
    .string()
    .max(500, "Descrição muito longa (máx 500 caracteres)")
    .optional()
    .or(z.literal("")),
});

export type ProductConfigForm = z.infer<typeof productConfigFormSchema>;

// ============================================================================
// Helpers
// ============================================================================

/** Helper: converte string de preço (do form) em número (pra API) */
export function parsePriceString(priceString: string): number {
  const clean = priceString.replace(/\D/g, "");
  return Number(clean) / 100;
}

/**
 * Helper: junta array de peças numa string amigável.
 * - 1 peça: "Blusa"
 * - 2 peças: "Blusa + Calça"
 * - 3+ peças: "Blusa + Calça + Tênis"
 * - "Conjunto" sozinho vira "Conjunto" (sem alterar)
 */
export function joinGarmentTypes(types: readonly string[]): string {
  if (types.length === 0) return "";
  if (types.length === 1) return types[0];
  // Se "Conjunto" tá presente sozinho, mantém. Se tiver outros, usa ele como prefixo.
  if (types.includes("Conjunto") && types.length > 1) {
    const others = types.filter((t) => t !== "Conjunto");
    return `Conjunto (${others.join(" + ")})`;
  }
  return types.join(" + ");
}