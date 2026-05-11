import Link from "next/link";
import { listNewsletters } from "@sfvypaa/content";
import { Newspaper, Plus } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { ContentStatusBadge } from "@/components/content-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function NewslettersPage() {
  const newsletters = await listNewsletters();

  return (
    <AdminShell>
      <section className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal">Newsletters</h1>
            <p className="mt-2 text-white/62">
              Manage public newsletter archive posts.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/newsletters/new" />}
            className="h-11 rounded-[8px] bg-[#ffcf6b] px-4 text-[#191109] hover:bg-[#f3b83f]"
          >
            <Plus className="size-4" />
            New newsletter
          </Button>
        </div>

        <div className="grid gap-4">
          {newsletters.length > 0 ? (
            newsletters.map((newsletter) => (
              <Link href={`/newsletters/${newsletter.id}`} key={newsletter.id}>
                <Card className="rounded-[8px] border-white/10 bg-white text-[#171310] ring-white/10 transition hover:-translate-y-0.5 hover:shadow-2xl">
                  <CardHeader className="gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <ContentStatusBadge status={newsletter.status} />
                      <Newspaper className="size-5 text-[#d94b2b]" />
                    </div>
                    <CardTitle className="text-2xl font-black">
                      {newsletter.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm text-[#5e554c]">
                    <p>{newsletter.publishDate}</p>
                    <p>{newsletter.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="rounded-[8px] border border-white/12 bg-white/10 p-8 text-center text-white/68">
              No newsletters yet.
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
