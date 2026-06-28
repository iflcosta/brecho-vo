/**
 * @spec docs/SPEC-SDD.md#tela-2-config
 * @description Formulário de configuração do produto (peças, tamanho, preço, estilo, descrição)
 * @author Mavis
 *
 * Mudança 28/06: garmentType (single select) → garmentTypes (multi-select).
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import {
  productConfigFormSchema,
  STYLES,
  parsePriceString,
  joinGarmentTypes,
  type ProductConfig,
  type ProductConfigForm,
} from "@/lib/schemas/config";
import { SizePills } from "@/components/config/SizePills";
import { GarmentTypePills } from "@/components/config/GarmentTypePills";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

export type ConfigFormProps = {
  /** URL da imagem uploaded na Tela 1 (pra thumbnail e validação) */
  imageUrl: string;
};

const STORAGE_KEY = "brecho-product-config-v1";

export function ConfigForm({ imageUrl }: ConfigFormProps) {
  const router = useRouter();
  const [previewPrice, setPreviewPrice] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductConfigForm>({
    resolver: zodResolver(productConfigFormSchema),
    defaultValues: {
      garmentTypes: [],
      size: undefined,
      price: "",
      style: undefined,
      description: "",
    },
  });

  // Carrega valores salvos do localStorage (se voltou pra editar)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ProductConfig> & {
          // Legacy field — may exist in old localStorage entries
          garmentType?: string | string[];
        };
        // Migração: se localStorage antigo tinha `garmentType` (string ou array)
        const legacy = parsed.garmentType;
        if (Array.isArray(parsed.garmentTypes) && parsed.garmentTypes.length > 0) {
          setValue("garmentTypes", parsed.garmentTypes as ProductConfigForm["garmentTypes"]);
        } else if (typeof legacy === "string" && legacy) {
          // Tenta extrair tipos do string legado ("Blusa + Calça")
          const tokens = legacy.split("+").map((s) => s.trim()).filter(Boolean);
          if (tokens.length > 0) {
            setValue("garmentTypes", tokens as ProductConfigForm["garmentTypes"]);
          }
        } else if (Array.isArray(legacy) && legacy.length > 0) {
          setValue("garmentTypes", legacy as ProductConfigForm["garmentTypes"]);
        }
        if (parsed.size) setValue("size", parsed.size);
        if (typeof parsed.price === "number") {
          const cents = Math.round(parsed.price * 100).toString();
          setValue("price", cents);
          setPreviewPrice(formatPrice(parsed.price));
        }
        if (parsed.style) setValue("style", parsed.style);
        if (parsed.description) setValue("description", parsed.description);
      }
    } catch {
      // localStorage indisponível
    }
  }, [setValue]);

  // Atualiza preview do preço em tempo real
  const priceValue = watch("price");
  useEffect(() => {
    if (!priceValue) {
      setPreviewPrice("");
      return;
    }
    if (typeof priceValue === "string") {
      const clean = priceValue.replace(/\D/g, "");
      if (!clean) {
        setPreviewPrice("");
        return;
      }
      const cents = Number(clean);
      const reais = cents / 100;
      setPreviewPrice(formatPrice(reais));
    }
  }, [priceValue]);

  function onSubmit(data: ProductConfigForm) {
    const numericData: ProductConfig = {
      garmentTypes: data.garmentTypes,
      size: data.size,
      price: parsePriceString(data.price),
      style: data.style,
      description: data.description || undefined,
    };

    try {
      const priceLabel = formatPrice(numericData.price);
      const persisted = { ...numericData, price: priceLabel };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
      localStorage.setItem("brecho-product-price-number", String(numericData.price));
    } catch {
      // ignora erro de storage
    }

    toast.success("Configuração salva!");
    router.push("/generate");
  }

  // Referência usada em teste (não removida)
  void imageUrl;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Toaster position="top-center" richColors />

      {/* === Tipo da roupa (multi-select) === */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1.5">
          Peça(s) <span className="text-red-500">*</span>
        </label>
        <Controller
          name="garmentTypes"
          control={control}
          render={({ field }) => (
            <GarmentTypePills
              value={field.value ?? []}
              onChange={field.onChange}
              error={errors.garmentTypes?.message}
            />
          )}
        />
      </div>

      {/* === Tamanho (pills) === */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1.5">
          Tamanho <span className="text-red-500">*</span>
        </label>
        <Controller
          name="size"
          control={control}
          render={({ field }) => (
            <SizePills
              value={field.value}
              onChange={field.onChange}
              error={errors.size?.message}
            />
          )}
        />
      </div>

      {/* === Preço === */}
      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1.5"
        >
          Preço <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 text-base pointer-events-none">
            R$
          </span>
          <input
            id="price"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            {...register("price")}
            aria-invalid={!!errors.price}
            className={cn(
              "w-full h-12 pl-10 pr-3 rounded-xl border-2 bg-white dark:bg-zinc-900",
              "text-zinc-900 dark:text-zinc-50 text-base",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
              errors.price
                ? "border-red-400"
                : "border-zinc-200 dark:border-zinc-700"
            )}
          />
        </div>
        {previewPrice && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Vai aparecer: <strong className="text-pink-600 dark:text-pink-400">{previewPrice}</strong>
          </p>
        )}
        {errors.price && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 mt-1.5">
            {errors.price.message}
          </p>
        )}
      </div>

      {/* === Estilo === */}
      <div>
        <label
          htmlFor="style"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1.5"
        >
          Estilo
        </label>
        <select
          id="style"
          {...register("style")}
          aria-invalid={!!errors.style}
          className={cn(
            "w-full h-12 px-3 rounded-xl border-2 bg-white dark:bg-zinc-900",
            "text-zinc-900 dark:text-zinc-50 text-base",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
            errors.style
              ? "border-red-400"
              : "border-zinc-200 dark:border-zinc-700"
          )}
        >
          <option value="">Selecione...</option>
          {STYLES.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
        {errors.style && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 mt-1.5">
            {errors.style.message}
          </p>
        )}
      </div>

      {/* === Descrição (opcional) === */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1.5"
        >
          Descrição <span className="text-zinc-400 text-xs font-normal">(opcional)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Ex: Peça em ótimo estado, sem manchas..."
          {...register("description")}
          aria-invalid={!!errors.description}
          className={cn(
            "w-full px-3 py-2.5 rounded-xl border-2 bg-white dark:bg-zinc-900",
            "text-zinc-900 dark:text-zinc-50 text-base resize-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
            errors.description
              ? "border-red-400"
              : "border-zinc-200 dark:border-zinc-700"
          )}
        />
        {errors.description && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 mt-1.5">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* === Submit === */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Salvando..." : "Gerar Imagem →"}
        </Button>
      </div>
    </form>
  );
}

// Re-exporta joinGarmentTypes pra uso em outros componentes
export { joinGarmentTypes };