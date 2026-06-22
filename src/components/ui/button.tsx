/**
 * @description Componente Button base do projeto (estilo tia-friendly: ≥48px altura)
 * @author Mavis
 *
 * Baseado no shadcn/ui pattern, mas sem dependência externa.
 * Mantém a interface compatível com Button do shadcn pra migração futura fácil.
 */
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "lg" | "sm";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-pink-600 text-white hover:bg-pink-700 active:bg-pink-800 shadow-sm",
  outline:
    "border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const sizeStyles: Record<ButtonSize, string> = {
  // default: 48px altura mínima (tia-friendly)
  default: "h-12 px-5 text-base font-medium rounded-xl",
  // lg: 56px, pra CTAs principais
  lg: "h-14 px-6 text-lg font-semibold rounded-xl",
  // sm: 40px, pra ações secundárias
  sm: "h-10 px-4 text-sm font-medium rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          // Base
          "inline-flex items-center justify-center gap-2",
          "transition-colors transition-shadow",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          // Variant + size
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
