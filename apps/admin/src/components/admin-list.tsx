import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* Shared pieces for the Events / Newsletters / Social Posts lists. */

export function ListFilters({
  basePath,
  counts,
  query,
  status,
  searchPlaceholder,
}: {
  basePath: string;
  counts: { all: number; published: number; draft: number };
  query: string;
  status: string;
  searchPlaceholder: string;
}) {
  const chips = [
    { id: "all", label: `All · ${counts.all}` },
    { id: "published", label: `Published · ${counts.published}` },
    { id: "draft", label: `Drafts · ${counts.draft}` },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const params = new URLSearchParams();
        if (chip.id !== "all") params.set("status", chip.id);
        if (query) params.set("q", query);
        const search = params.toString();

        return (
          <Link
            className={cn(
              "border-2 border-border px-3 py-1.5 font-mono text-xs font-bold tracking-[0.06em] uppercase transition-colors",
              status === chip.id
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-foreground hover:bg-foreground/10"
            )}
            href={search ? `${basePath}?${search}` : basePath}
            key={chip.id}
          >
            {chip.label}
          </Link>
        );
      })}
      <form action={basePath} className="ml-auto flex items-center gap-2">
        {status !== "all" ? (
          <input name="status" type="hidden" value={status} />
        ) : null}
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 w-52 pl-8 font-mono text-sm"
            defaultValue={query}
            name="q"
            placeholder={searchPlaceholder}
          />
        </div>
      </form>
    </div>
  );
}

export function ListRow({
  badges,
  title,
  meta,
  body,
  updated,
  actions,
}: {
  badges: React.ReactNode;
  title: string;
  meta: Array<{ icon: LucideIcon; text: string }>;
  body: string;
  updated: string;
  actions: React.ReactNode;
}) {
  return (
    <article className="border-[3px] border-border bg-card p-6 text-card-foreground shadow-stamp">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">{badges}</div>
      <h3 className="mb-3 text-[1.7rem] leading-[0.98] text-foreground">
        {title}
      </h3>
      <div className="mb-3 flex flex-wrap gap-x-4.5 gap-y-1.5">
        {meta.map(({ icon: Icon, text }) => (
          <span className="inline-flex items-center gap-1.5" key={text}>
            <Icon className="size-3.5 text-orange" />
            <span className="font-mono text-[13px] font-bold text-foreground">
              {text}
            </span>
          </span>
        ))}
      </div>
      <p className="max-w-[64ch] text-sm leading-[1.55] text-text-soft">
        {body}
      </p>
      <div className="mt-4.5 flex flex-wrap items-center gap-2.5 border-t-2 border-border/35 pt-4">
        <span className="mr-auto font-mono text-xs text-muted-foreground">
          Updated {updated}
        </span>
        {actions}
      </div>
    </article>
  );
}

export function ListEmpty({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="border-2 border-dashed border-border/35 px-6 py-[72px] text-center">
      <Icon className="mx-auto mb-4 size-9 text-muted-foreground" />
      <h3 className="mb-2.5 text-[1.8rem] text-foreground">{title}</h3>
      <p className="mx-auto mb-5.5 max-w-[40ch] text-[15px] text-text-soft">
        {body}
      </p>
      {action}
    </div>
  );
}
