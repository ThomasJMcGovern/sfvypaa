import Link from "next/link";
import { listSocialPosts, type SocialPostRecord } from "@valleypaa/content";
import {
  AtSign,
  CalendarDays,
  EyeOff,
  LinkIcon,
  Pencil,
  Plus,
  Upload,
} from "lucide-react";

import { toggleSocialPostStatusAction } from "@/app/actions";
import { ListEmpty, ListFilters, ListRow } from "@/components/admin-list";
import { AdminPageHead, AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-session";
import { ContentStatusBadge } from "@/components/content-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteSocialPostForm } from "@/components/social-post-form";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SocialPostsSearchParams = Promise<{
  q?: string;
  status?: string;
}>;

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function publicSiteUrl() {
  return (process.env.SFVYPAA_PUBLIC_SITE_URL || "https://valleypaa.org").replace(
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

function matchesSocialPost(
  post: SocialPostRecord,
  query: string,
  status: string,
) {
  const queryText = query.toLowerCase();
  const matchesStatus = status === "all" || post.status === status;
  const matchesQuery =
    !queryText ||
    [post.title, post.caption, post.instagramUrl]
      .join(" ")
      .toLowerCase()
      .includes(queryText);

  return matchesStatus && matchesQuery;
}

export default async function SocialPostsPage({
  searchParams,
}: {
  searchParams: SocialPostsSearchParams;
}) {
  const params = await searchParams;
  const admin = await requireAdmin();
  const query = params.q?.trim() ?? "";
  const status = cleanStatus(params.status);
  const posts = await listSocialPosts();
  const filteredPosts = posts.filter((post) =>
    matchesSocialPost(post, query, status),
  );

  return (
    <AdminShell active="social-posts" admin={admin} publicSiteUrl={publicSiteUrl()}>
      <div className="mx-auto max-w-[920px]">
        <AdminPageHead
          action={
            <Button
              nativeButton={false}
              render={<Link href="/social-posts/new" />}
            >
              <Plus data-icon="inline-start" />
              New social post
            </Button>
          }
          eyebrow="Manage"
          sub="Curated Instagram highlights featured on the public homepage."
          title="Social Posts"
        />

        <ListFilters
          basePath="/social-posts"
          counts={{
            all: posts.length,
            published: posts.filter((p) => p.status === "published").length,
            draft: posts.filter((p) => p.status === "draft").length,
          }}
          query={query}
          searchPlaceholder="Title, caption…"
          status={status}
        />

        {filteredPosts.length === 0 ? (
          <ListEmpty
            action={
              <Button
                nativeButton={false}
                render={<Link href="/social-posts/new" />}
              >
                <Plus data-icon="inline-start" />
                New social post
              </Button>
            }
            body={
              query || status !== "all"
                ? "No social posts match these filters. Clear them or curate a new one."
                : "Curate your first Instagram highlight for the public homepage."
            }
            icon={AtSign}
            title="Nothing here yet"
          />
        ) : (
          <div className="flex flex-col gap-4.5">
            {filteredPosts.map((post) => (
              <ListRow
                actions={
                  <>
                    {post.status === "published" || post.imageUrl ? (
                      <form action={toggleSocialPostStatusAction}>
                        <input name="id" type="hidden" value={post.id} />
                        <input
                          name="nextStatus"
                          type="hidden"
                          value={
                            post.status === "published" ? "draft" : "published"
                          }
                        />
                        <Button size="sm" type="submit" variant="outline">
                          {post.status === "published" ? (
                            <EyeOff data-icon="inline-start" />
                          ) : (
                            <Upload data-icon="inline-start" />
                          )}
                          {post.status === "published"
                            ? "Unpublish"
                            : "Publish"}
                        </Button>
                      </form>
                    ) : null}
                    <Link
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" })
                      )}
                      href={`/social-posts/${post.id}`}
                    >
                      <Pencil data-icon="inline-start" />
                      Edit
                    </Link>
                    <DeleteSocialPostForm id={post.id} title={post.title} />
                  </>
                }
                badges={
                  <>
                    <ContentStatusBadge status={post.status} />
                    {post.imageUrl ? (
                      <Badge variant="outline">Image</Badge>
                    ) : (
                      <Badge className="border-warn bg-transparent text-warn">
                        Needs image
                      </Badge>
                    )}
                  </>
                }
                body={post.caption}
                key={post.id}
                meta={[
                  {
                    icon: CalendarDays,
                    text:
                      post.status === "published"
                        ? post.postDate
                        : "Unpublished",
                  },
                  { icon: LinkIcon, text: "Linked" },
                ]}
                title={post.title}
                updated={formatDate(post.updatedAt)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
