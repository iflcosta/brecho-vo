/**
 * @spec docs/SPEC-SDD.md#tela-2-config
 * @description Formulário de configuração do produto (tipo, tamanho, preço, estilo, descrição)
 * @author Mavis
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import {
  productConfigFormSchema,
  GARMENT_TYPES,
  STYLES,
  parsePriceString,
  type ProductConfig,
  type ProductConfigForm,
} from "@/lib/schemas/config";
import { SizePills } from "@/components/config/SizePills";
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
      garmentType: undefined,
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
        const parsed = JSON.parse(stored) as Partial<ProductConfig>;
        if (parsed.garmentType) setValue("garmentType", parsed.garmentType);
        if (parsed.size) setValue("size", parsed.size);
        if (typeof parsed.price === "number") {
          // Reconstrói o formato "4500" (cents string) a partir do número
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

  // Atualiza preview do preço em tempo real (formato R$ 0,00)
  const priceValue = watch("price");
  useEffect(() => {
    if (!priceValue) {
      setPreviewPrice("");
      return;
    }
    // Se for string (form mode), aplica máscara. Se for number (fallback), formata.
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
    // Converte price de string (form) pra number (ProductConfig + API)
    const numericData: ProductConfig = {
      garmentType: data.garmentType,
      size: data.size,
      price: parsePriceString(data.price),
      style: data.style,
      description: data.description || undefined,
    };

    try {
      // Formata preço como string "R$ 0,00" pra legibilidade
      const priceLabel = formatPrice(numericData.price);
      const persisted = { ...numericData, price: priceLabel };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
      // Mas também persiste o número pra API usar
      localStorage.setItem("brecho-product-price-number", String(numericData.price));
    } catch {
      // ignora erro de storage
    }

    toast.success("Configuração salva!");
    router.push("/generate");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Toaster position="top-center" richColors />

      {/* === Tipo da roupa === */}
      <div>
        <label
          htmlFor="garmentType"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1.5"
        >
          Tipo da roupa <span className="text-red-500">*</span>
        </label>
        <select
          id="garmentType"
          {...register("garmentType")}
          aria-invalid={!!errors.garmentType}
          className={cn(
            "w-full h-12 px-3 rounded-xl border-2 bg-white dark:bg-zinc-900",
            "text-zinc-900 dark:text-zinc-50 text-base",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
            errors.garmentType
              ? "border-red-400"
              : "border-zinc-200 dark:border-zinc-700"
          )}
        >
          <option value="">Selecione...</option>
          {GARMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.garmentType && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 mt-1.5">
            {errors.garmentType.message}
          </p>
        )}
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
