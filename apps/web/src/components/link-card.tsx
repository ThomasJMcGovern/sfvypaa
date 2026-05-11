import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LinkCardProps = {
  title: string
  body: string
  imageAlt: string
  imageSrc: string
  buttonLabel: string
  href: string
  external?: boolean
  imageMode?: "cover" | "contain"
  reverse?: boolean
}

export function LinkCard({
  title,
  body,
  imageAlt,
  imageSrc,
  buttonLabel,
  href,
  external,
  imageMode = "cover",
  reverse,
}: LinkCardProps) {
  return (
    <section className="px-5 py-16 sm:px-8 lg:px-10">
      <div
        className={cn(
          "mx-auto grid max-w-6xl gap-0 lg:grid-cols-[1fr_0.58fr] lg:items-center",
          reverse && "lg:grid-cols-[0.58fr_1fr]"
        )}
      >
        <div
          className={cn(
            "relative min-h-[320px] overflow-hidden rounded-[8px] bg-[#2a241e] lg:min-h-[520px]",
            imageMode === "contain" && "bg-[#f3ead9]",
            reverse && "lg:order-2"
          )}
        >
          <Image
            alt={imageAlt}
            className={imageMode === "contain" ? "object-contain" : "object-cover"}
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            src={imageSrc}
          />
        </div>
        <div
          className={cn(
            "relative z-10 mx-4 -mt-12 rounded-[8px] bg-white p-8 text-[#171310] shadow-2xl lg:mx-0 lg:-ml-20 lg:mt-0 lg:p-14",
            reverse && "lg:order-1 lg:-mr-20 lg:ml-0"
          )}
        >
          <h2 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">
            {title}
          </h2>
          <p className="mt-5 text-base leading-7 text-[#5e554c]">{body}</p>
          <Button
            className="mt-7 h-12 rounded-[8px] bg-[#171310] px-5 text-white hover:bg-[#2c241d]"
            nativeButton={false}
            render={
              <a
                href={href}
                rel={external ? "noreferrer" : undefined}
                target={external ? "_blank" : undefined}
              />
            }
          >
            {buttonLabel}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  )
}
