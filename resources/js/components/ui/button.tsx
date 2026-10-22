import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-brand-blue text-white shadow-sm enabled:hover:-translate-y-0.5 enabled:hover:bg-brand-blue-dark enabled:hover:shadow-md motion-reduce:transition-none motion-reduce:hover:transform-none",
        destructive:
          "bg-red-600 text-white shadow-sm enabled:hover:bg-red-700",
        outline:
          "border border-slate-200 bg-white text-slate-700 enabled:hover:bg-slate-50",
        secondary:
          "bg-brand-soft text-brand-navy enabled:hover:bg-brand-tint",
        ghost: "text-slate-600 enabled:hover:bg-slate-100 enabled:hover:text-brand-navy",
        link: "text-brand-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-2 has-[>svg]:px-3",
        sm: "px-3 has-[>svg]:px-2.5",
        lg: "px-6 has-[>svg]:px-4",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
