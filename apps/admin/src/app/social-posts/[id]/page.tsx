import Link from "next/link";
import { notFound } from "next/navigation";
import { emptySocialPost, getSocialPost } from "@sfvypaa/content";
import { ArrowLeft } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-session";
import { ContentStatusBadge } from "@/components/content-status-badge";
import {
  DeleteSocialPostForm,
  SocialPostForm,
} from "@/components/social-post-form";

export const dynamic = "force-dynamic";

function publicSiteUrl() {
  return (process.env.SFVYPAA_PUBLIC_SITE_URL || "https://sfvypaa.org").replace(
    /\/+$/,
    "",
  );
}

export default async function SocialPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await requireAdmin();
  const isNew = id === "new";
  const post = isNew ? emptySocialPost : await getSocialPost(id);

  if (!post) {
    notFound();
  }

  return (
    <AdminShell active="social-posts" admin={admin} publicSiteUrl={publicSiteUrl()}>
      <div className="mx-auto max-w-[840px]">
        <Link
          className="mb-5 inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[0.08em] text-orange uppercase transition-colors hover:text-foreground"
          href="/social-posts"
        >
          <ArrowLeft className="size-[15px]" /> Back to social posts
        </Link>
        <div className="mb-6 flex flex-wrap items-center gap-3.5">
          <h1 className="text-[clamp(2.2rem,4vw,3rem)] text-foreground">
            {isNew ? "New social post" : "Edit social post"}
          </h1>
          <ContentStatusBadge status={post.status} />
          {!isNew ? (
            <div className="ml-auto">
              <DeleteSocialPostForm id={id} title={post.title} />
            </div>
          ) : null}
        </div>
        <SocialPostForm post={post} publicSiteUrl={publicSiteUrl()} />
      </div>
    </AdminShell>
  );
}
