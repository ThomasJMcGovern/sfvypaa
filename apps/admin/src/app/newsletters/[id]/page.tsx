import { notFound } from "next/navigation";
import { emptyNewsletter, getNewsletter } from "@sfvypaa/content";

import { AdminShell } from "@/components/admin-shell";
import {
  DeleteNewsletterForm,
  NewsletterForm,
} from "@/components/newsletter-form";

export const dynamic = "force-dynamic";

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
    <AdminShell>
      <section className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal">
              {isNew ? "New newsletter" : "Edit newsletter"}
            </h1>
            <p className="mt-2 text-white/62">
              Save as draft or publish to the public newsletter archive.
            </p>
          </div>
          {!isNew ? (
            <DeleteNewsletterForm id={id} title={newsletter.title} />
          ) : null}
        </div>
        <div className="rounded-[8px] border border-white/10 bg-white/[0.06] p-5 sm:p-7">
          <NewsletterForm newsletter={newsletter} />
        </div>
      </section>
    </AdminShell>
  );
}
