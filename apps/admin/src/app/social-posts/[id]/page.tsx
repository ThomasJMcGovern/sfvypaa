import { notFound } from "next/navigation";
import { emptySocialPost, getSocialPost } from "@sfvypaa/content";

import { AdminShell } from "@/components/admin-shell";
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
  const isNew = id === "new";
  const post = isNew ? emptySocialPost : await getSocialPost(id);

  if (!post) {
    notFound();
  }

  return (
    <AdminShell active="social-posts">
      <section className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal">
              {isNew ? "New social post" : "Edit social post"}
            </h1>
            <p className="mt-2 text-white/62">
              Curate Instagram posts for the public homepage feed.
            </p>
          </div>
          {!isNew ? <DeleteSocialPostForm id={id} title={post.title} /> : null}
        </div>
        <div className="rounded-[8px] border border-white/10 bg-white/[0.06] p-5 sm:p-7">
          <SocialPostForm post={post} publicSiteUrl={publicSiteUrl()} />
        </div>
      </section>
    </AdminShell>
  );
}
