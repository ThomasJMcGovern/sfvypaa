import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* Chunky, stamp-like buttons: hard offset shadow that presses flat on
   click, like physically stamping ink onto paper. */
const stamp =
  "border-[3px] shadow-stamp hover:translate-x-px hover:translate-y-px hover:shadow-stamp-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent text-sm font-bold tracking-[0.06em] uppercase whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-100 ease-(--ease-snap) outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: cn(stamp, "border-ink bg-orange text-ink"),
        pink: cn(stamp, "border-ink bg-pink text-ink"),
        secondary: cn(stamp, "border-border bg-primary text-primary-foreground"),
        outline: cn(stamp, "border-border bg-transparent text-foreground"),
        destructive: cn(stamp, "border-ink bg-stop text-paper"),
        ghost:
          "text-foreground hover:bg-foreground/10 aria-expanded:bg-foreground/10",
        link: "text-accent underline decoration-2 underline-offset-4 hover:text-foreground",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 text-[0.8125rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-1.5 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
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
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
