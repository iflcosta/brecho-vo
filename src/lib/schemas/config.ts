/**
 * @spec docs/SPEC-SDD.md#tela-2-config
 * @description Schema Zod + types compartilhados do formulário de configuração
 * @author Mavis
 *
 * Centraliza a validação pra que:
 * - O frontend use o mesmo tipo que o backend (single source of truth)
 * - A próxima seção (Tela 5 — Caption) possa reusar o tipo de roupa
 */
import { z } from "zod";

// ============================================================================
// Enums (listas fixas do SPEC — mantenha sincronizado com /api/caption)
// ============================================================================

/** Tipos de roupa que a tia pode anunciar */
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
// Schema Zod
// ============================================================================

/** Schema da config do produto. Coincide com o model Post do Prisma. */
export const productConfigSchema = z.object({
  garmentType: z.enum(GARMENT_TYPES, {
    message: "Selecione o tipo da roupa",
  }),
  size: z.enum(SIZES, {
    message: "Selecione o tamanho",
  }),
  /** Preço em reais (sem prefixo R$). Ex: 45.00 = R$ 45,00 */
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

/** Tipo inferido do schema (single source of truth pro form) */
export type ProductConfig = z.infer<typeof productConfigSchema>;

/** Versão do schema com price como string (pra usar com input type="text") */
export const productConfigFormSchema = z.object({
  garmentType: z.enum(GARMENT_TYPES, {
    message: "Selecione o tipo da roupa",
  }),
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

/** Helper: converte string de preço (do form) em número (pra API) */
export function parsePriceString(priceString: string): number {
  const clean = priceString.replace(/\D/g, "");
  return Number(clean) / 100;
}
