import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LinkRowProps = {
  eyebrow: string
  title: string
  body: string
  cta: string
  href: string
  imageSrc: string
  imageAlt: string
  external?: boolean
  imageMode?: "cover" | "contain"
  flip?: boolean
}

export function LinkRow({
  eyebrow,
  title,
  body,
  cta,
  href,
  imageSrc,
  imageAlt,
  external,
  imageMode = "cover",
  flip,
}: LinkRowProps) {
  return (
    <div className="grid overflow-hidden border-[3px] border-border bg-card shadow-stamp-lg md:grid-cols-2">
      <div
        className={cn(
          "relative min-h-[300px]",
          imageMode === "contain" ? "bg-bone-2" : "bg-bone-3",
          flip && "md:order-2"
        )}
      >
        <Image
          alt={imageAlt}
          className={cn(
            imageMode === "contain" ? "object-contain" : "duotone object-cover"
          )}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          src={imageSrc}
        />
      </div>
      <div
        className={cn(
          "flex items-center border-t-[3px] border-border px-8 py-9 md:border-t-0",
          flip ? "md:order-1 md:border-r-[3px]" : "md:border-l-[3px]"
        )}
      >
        <div>
          <p className="label-stamp mb-2.5 text-orange">{eyebrow}</p>
          <h3 className="mb-3 text-[clamp(2rem,4vw,3rem)] text-foreground">
            {title}
          </h3>
          <p className="mb-5 max-w-[34ch] text-[15px] leading-[1.55] text-text-soft">
            {body}
          </p>
          <Button
            nativeButton={false}
            render={
              <a
                href={href}
                rel={external ? "noreferrer" : undefined}
                target={external ? "_blank" : undefined}
              />
            }
            variant="outline"
          >
            {cta}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  )
}
