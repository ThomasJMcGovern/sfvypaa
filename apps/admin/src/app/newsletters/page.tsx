import Link from "next/link";
import { listNewsletters, type NewsletterRecord } from "@sfvypaa/content";
import { Edit3, ExternalLink, Plus, Search } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { ContentStatusBadge } from "@/components/content-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

type NewslettersSearchParams = Promise<{
  q?: string;
  status?: string;
}>;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function publicSiteUrl() {
  return (process.env.SFVYPAA_PUBLIC_SITE_URL || "https://sfvypaa.org").replace(
    /\/+$/,
    "",
  );
}

function cleanStatus(value: string | undefined) {
  return value === "draft" || value === "published" ? value : "all";
}

function formatNewsletterDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value || "Not set";
  }

  const [, year, month, day] = match;
  return dateFormatter.format(
    new Date(Number(year), Number(month) - 1, Number(day)),
  );
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(date);
}

function matchesNewsletter(
  newsletter: NewsletterRecord,
  query: string,
  status: string,
) {
  const queryText = query.toLowerCase();
  const matchesStatus = status === "all" || newsletter.status === status;
  const matchesQuery =
    !queryText ||
    [newsletter.title, newsletter.slug, newsletter.excerpt, newsletter.body]
      .join(" ")
      .toLowerCase()
      .includes(queryText);

  return matchesStatus && matchesQuery;
}

export default async function NewslettersPage({
  searchParams,
}: {
  searchParams: NewslettersSearchParams;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = cleanStatus(params.status);
  const newsletters = await listNewsletters();
  const filteredNewsletters = newsletters.filter((newsletter) =>
    matchesNewsletter(newsletter, query, status),
  );
  const statusLabel =
    status === "all" ? "All statuses" : status === "published" ? "Published" : "Draft";

  return (
    <AdminShell active="newsletters">
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

        <form className="grid gap-3 rounded-[8px] border border-white/10 bg-white/[0.06] p-4 lg:grid-cols-[1fr_12rem_auto_auto]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-white/72">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5e554c]" />
              <Input
                className="h-11 rounded-[8px] border-white/15 bg-white pl-9 text-[#171310]"
                defaultValue={query}
                name="q"
                placeholder="Title, slug, excerpt"
              />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-white/72">Status</span>
            <select
              className="h-11 rounded-[8px] border border-white/15 bg-white px-3 text-[#171310] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              defaultValue={status}
              name="status"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <Button
            className="h-11 self-end rounded-[8px] bg-white px-4 text-[#171310] hover:bg-[#f5eee5]"
            type="submit"
          >
            Filter
          </Button>
          {query || status !== "all" ? (
            <Button
              className="h-11 self-end rounded-[8px] border-white/20 bg-transparent px-4 text-white hover:bg-white/10"
              nativeButton={false}
              render={<Link href="/newsletters" />}
              variant="outline"
            >
              Clear
            </Button>
          ) : null}
        </form>

        <div className="overflow-hidden rounded-[8px] border border-white/10 bg-white text-[#171310]">
          <div className="flex items-center justify-between border-b border-[#171310]/10 px-4 py-3">
            <p className="text-sm font-semibold text-[#5e554c]">
              {filteredNewsletters.length} of {newsletters.length} newsletters
            </p>
            <p className="text-sm font-semibold text-[#5e554c]">{statusLabel}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[62rem] text-left text-sm">
              <thead className="bg-[#f5eee5] text-xs uppercase tracking-normal text-[#6f655b]">
                <tr>
                  <th className="px-4 py-3 font-black">Newsletter</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Publish date</th>
                  <th className="px-4 py-3 font-black">Slug</th>
                  <th className="px-4 py-3 font-black">Updated</th>
                  <th className="px-4 py-3 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171310]/10">
                {filteredNewsletters.length > 0 ? (
                  filteredNewsletters.map((newsletter) => (
                    <tr
                      className="align-top transition hover:bg-[#fbfaf8]"
                      key={newsletter.id}
                    >
                      <td className="px-4 py-4">
                        <p className="font-black">{newsletter.title}</p>
                        <p className="mt-1 max-w-md truncate text-[#6f655b]">
                          {newsletter.excerpt || "No excerpt"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <ContentStatusBadge status={newsletter.status} />
                      </td>
                      <td className="px-4 py-4 text-[#5e554c]">
                        {formatNewsletterDate(newsletter.publishDate)}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-[#5e554c]">
                        {newsletter.slug}
                      </td>
                      <td className="px-4 py-4 text-[#5e554c]">
                        {formatDate(newsletter.updatedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            className="h-9 rounded-[8px] border-[#171310]/15 px-3 text-[#171310] hover:bg-[#f5eee5]"
                            nativeButton={false}
                            render={<Link href={`/newsletters/${newsletter.id}`} />}
                            variant="outline"
                          >
                            <Edit3 className="size-4" />
                            Edit
                          </Button>
                          {newsletter.status === "published" ? (
                            <Button
                              className="h-9 rounded-[8px] border-[#171310]/15 px-3 text-[#171310] hover:bg-[#f5eee5]"
                              nativeButton={false}
                              render={
                                <a
                                  href={`${publicSiteUrl()}/newsletters/${newsletter.slug}`}
                                  rel="noreferrer"
                                  target="_blank"
                                />
                              }
                              variant="outline"
                            >
                              <ExternalLink className="size-4" />
                              Public
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center text-[#6f655b]" colSpan={6}>
                      No newsletters match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
