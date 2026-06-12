import Link from "next/link";
import { listNewsletters, type NewsletterRecord } from "@sfvypaa/content";
import {
  CalendarDays,
  EyeOff,
  FileText,
  Newspaper,
  Pencil,
  Plus,
  Upload,
} from "lucide-react";

import { toggleNewsletterStatusAction } from "@/app/actions";
import { ListEmpty, ListFilters, ListRow } from "@/components/admin-list";
import { AdminPageHead, AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-session";
import { ContentStatusBadge } from "@/components/content-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteNewsletterForm } from "@/components/newsletter-form";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type NewslettersSearchParams = Promise<{
  q?: string;
  status?: string;
}>;

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

function formatDate(value: string | undefined) {
  if (!value) {
    return "not set";
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
  const admin = await requireAdmin();
  const query = params.q?.trim() ?? "";
  const status = cleanStatus(params.status);
  const newsletters = await listNewsletters();
  const filteredNewsletters = newsletters.filter((newsletter) =>
    matchesNewsletter(newsletter, query, status),
  );

  return (
    <AdminShell active="newsletters" admin={admin} publicSiteUrl={publicSiteUrl()}>
      <div className="mx-auto max-w-[920px]">
        <AdminPageHead
          action={
            <Button
              nativeButton={false}
              render={<Link href="/newsletters/new" />}
            >
              <Plus data-icon="inline-start" />
              New newsletter
            </Button>
          }
          eyebrow="Manage"
          sub="Committee updates and announcements published to the archive."
          title="Newsletters"
        />

        <ListFilters
          basePath="/newsletters"
          counts={{
            all: newsletters.length,
            published: newsletters.filter((n) => n.status === "published")
              .length,
            draft: newsletters.filter((n) => n.status === "draft").length,
          }}
          query={query}
          searchPlaceholder="Title, slug…"
          status={status}
        />

        {filteredNewsletters.length === 0 ? (
          <ListEmpty
            action={
              <Button
                nativeButton={false}
                render={<Link href="/newsletters/new" />}
              >
                <Plus data-icon="inline-start" />
                New newsletter
              </Button>
            }
            body={
              query || status !== "all"
                ? "No newsletters match these filters. Clear them or write a new issue."
                : "Write your first issue and publish it to the zine rack."
            }
            icon={Newspaper}
            title="Nothing here yet"
          />
        ) : (
          <div className="flex flex-col gap-4.5">
            {filteredNewsletters.map((newsletter) => (
              <ListRow
                actions={
                  <>
                    <form action={toggleNewsletterStatusAction}>
                      <input name="id" type="hidden" value={newsletter.id} />
                      <input
                        name="nextStatus"
                        type="hidden"
                        value={
                          newsletter.status === "published"
                            ? "draft"
                            : "published"
                        }
                      />
                      <Button size="sm" type="submit" variant="outline">
                        {newsletter.status === "published" ? (
                          <EyeOff data-icon="inline-start" />
                        ) : (
                          <Upload data-icon="inline-start" />
                        )}
                        {newsletter.status === "published"
                          ? "Unpublish"
                          : "Publish"}
                      </Button>
                    </form>
                    <Link
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" })
                      )}
                      href={`/newsletters/${newsletter.id}`}
                    >
                      <Pencil data-icon="inline-start" />
                      Edit
                    </Link>
                    <DeleteNewsletterForm
                      id={newsletter.id}
                      title={newsletter.title}
                    />
                  </>
                }
                badges={<ContentStatusBadge status={newsletter.status} />}
                body={newsletter.excerpt}
                key={newsletter.id}
                meta={[
                  {
                    icon: CalendarDays,
                    text:
                      newsletter.status === "published"
                        ? newsletter.publishDate
                        : "Unpublished",
                  },
                  { icon: FileText, text: `/${newsletter.slug}` },
                ]}
                title={newsletter.title}
                updated={formatDate(newsletter.updatedAt)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
