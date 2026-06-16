"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AtSign, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SocialCard = {
  id: string
  title: string
  caption: string
  instagramUrl: string
  imageUrl: string
  dateLabel: string
}

export function SocialCarousel({
  posts,
  instagramUrl,
}: {
  posts: SocialCard[]
  instagramUrl: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [update, posts.length])

  function scroll(direction: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>("[data-card]")
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8
    el.scrollBy({ left: direction * step, behavior: "smooth" })
  }

  return (
    <section
      className="mx-auto w-full max-w-7xl px-5 pt-[72px] sm:px-8 lg:px-10"
      id="socials"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-stamp mb-2 flex items-center gap-2 text-orange">
            <AtSign className="size-[15px]" /> Instagram
          </p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] text-foreground">
            Socials
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {posts.length > 0 ? (
            <>
              <CarouselButton
                disabled={!canPrev}
                label="Previous posts"
                onClick={() => scroll(-1)}
              >
                <ChevronLeft className="size-5" />
              </CarouselButton>
              <CarouselButton
                disabled={!canNext}
                label="Next posts"
                onClick={() => scroll(1)}
              >
                <ChevronRight className="size-5" />
              </CarouselButton>
            </>
          ) : null}
          <Button
            nativeButton={false}
            render={
              <a href={instagramUrl} rel="noreferrer" target="_blank" />
            }
            variant="outline"
          >
            <AtSign data-icon="inline-start" />
            @valleypaa
          </Button>
        </div>
      </div>

      {posts.length > 0 ? (
        <div
          aria-label="VALLEYPAA Instagram posts"
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pr-5 pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={update}
          ref={trackRef}
          role="region"
        >
          {posts.map((post) => (
            <article
              className="flex w-[78%] shrink-0 snap-start flex-col border-[3px] border-border bg-card text-card-foreground shadow-stamp-lg sm:w-[320px]"
              data-card
              key={post.id}
            >
              <a
                className="group block"
                href={post.instagramUrl}
                rel="noreferrer"
                target="_blank"
              >
                <div className="halftone relative aspect-square border-b-[3px] border-border bg-bone-2">
                  {post.imageUrl ? (
                    <Image
                      alt={post.title}
                      className="object-cover transition group-hover:scale-[1.02]"
                      fill
                      sizes="(min-width: 640px) 320px, 80vw"
                      src={post.imageUrl}
                      unoptimized
                    />
                  ) : (
                    <span className="label-stamp absolute inset-0 flex items-center justify-center text-muted-foreground">
                      Instagram post
                    </span>
                  )}
                </div>
              </a>
              <div className="flex grow flex-col p-4">
                <p className="mb-1.5 font-mono text-xs font-bold text-orange uppercase">
                  {post.dateLabel}
                </p>
                <h3 className="mb-2 text-[21px] leading-[0.95] text-foreground">
                  {post.title}
                </h3>
                <p className="mb-4 grow text-sm leading-normal text-text-soft">
                  {post.caption}
                </p>
                <Button
                  className="w-full"
                  nativeButton={false}
                  render={
                    <a
                      href={post.instagramUrl}
                      rel="noreferrer"
                      target="_blank"
                    />
                  }
                  size="sm"
                  variant="outline"
                >
                  View on Instagram
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-border/35 px-5 py-12 text-center">
          <p className="text-base text-muted-foreground">
            New Instagram highlights will appear here once they&apos;re
            published.
          </p>
        </div>
      )}
    </section>
  )
}

function CarouselButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode
  disabled: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex size-10 items-center justify-center border-[3px] border-border bg-card text-foreground shadow-stamp transition-[transform,box-shadow,opacity] duration-100 ease-(--ease-snap)",
        "hover:translate-x-px hover:translate-y-px hover:shadow-stamp-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        "disabled:pointer-events-none disabled:opacity-35 disabled:shadow-stamp",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}
