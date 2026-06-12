import Link from "next/link";
import { notFound } from "next/navigation";
import { emptyNewsletter, getNewsletter } from "@sfvypaa/content";
import { ArrowLeft } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { ContentStatusBadge } from "@/components/content-status-badge";
import {
  DeleteNewsletterForm,
  NewsletterForm,
} from "@/components/newsletter-form";

export const dynamic = "force-dynamic";

function publicSiteUrl() {
  return (process.env.SFVYPAA_PUBLIC_SITE_URL || "https://sfvypaa.org").replace(
    /\/+$/,
    "",
  );
}

export default async function NewsletterEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const newsletter = isNew ? emptyNewsletter : await getNewsletter(id);

  if (!newsletter) {
    notFound();
  }

  return (
    <AdminShell active="newsletters" publicSiteUrl={publicSiteUrl()}>
      <div className="mx-auto max-w-[840px]">
        <Link
          className="mb-5 inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[0.08em] text-orange uppercase transition-colors hover:text-foreground"
          href="/newsletters"
        >
          <ArrowLeft className="size-[15px]" /> Back to newsletters
        </Link>
        <div className="mb-6 flex flex-wrap items-center gap-3.5">
          <h1 className="text-[clamp(2.2rem,4vw,3rem)] text-foreground">
            {isNew ? "New newsletter" : "Edit newsletter"}
          </h1>
          <ContentStatusBadge status={newsletter.status} />
          {!isNew ? (
            <div className="ml-auto">
              <DeleteNewsletterForm id={id} title={newsletter.title} />
            </div>
          ) : null}
        </div>
        <NewsletterForm
          newsletter={newsletter}
          publicSiteUrl={publicSiteUrl()}
        />
      </div>
    </AdminShell>
  );
}
