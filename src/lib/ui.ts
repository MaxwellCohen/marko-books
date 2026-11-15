import { cn } from "@/lib/utils";

type Variant = "ghost" | "primary" | "secondary";
type Size = "default" | "icon" | "sm";

const base =
  "focus-visible:ring-action/40 inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const sizes: Record<Size, string> = {
  default: "h-9 px-4 text-sm",
  icon: "size-9",
  sm: "h-8 px-3 text-xs",
};

const variants: Record<Variant, string> = {
  ghost: "text-muted hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white",
  primary: "bg-action text-white hover:bg-action-hover",
  secondary:
    "border-divider hover:border-gray/40 hover:bg-card dark:border-divider-dark dark:hover:border-gray/30 dark:hover:bg-card-dark border bg-white text-black dark:bg-transparent dark:text-white",
};

export function buttonClasses(props: { class?: string; size?: Size; variant?: Variant } = {}) {
  return cn(base, sizes[props.size ?? "default"], variants[props.variant ?? "primary"], props.class);
}

export const fieldClass =
  "border-divider placeholder-gray focus:border-accent focus:ring-accent/25 dark:border-divider-dark disabled:bg-card disabled:text-muted dark:disabled:bg-card-dark w-full border bg-white text-black transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#1c1c1c] dark:text-white";

export const stepClass =
  "text-muted hover:bg-card dark:hover:bg-card-dark focus-visible:ring-action/40 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white";

export const labelClass = "text-muted text-xs font-semibold tracking-wide uppercase";
