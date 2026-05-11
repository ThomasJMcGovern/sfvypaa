import { notFound } from "next/navigation";
import { emptyEvent, getEvent } from "@sfvypaa/content";

import { AdminShell } from "@/components/admin-shell";
import { DeleteEventForm, EventForm } from "@/components/event-form";

export const dynamic = "force-dynamic";

export default async function EventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const event = isNew ? emptyEvent : await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <AdminShell>
      <section className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal">
              {isNew ? "New event" : "Edit event"}
            </h1>
            <p className="mt-2 text-white/62">
              Save as draft or publish to the public events page.
            </p>
          </div>
          {!isNew ? <DeleteEventForm id={id} /> : null}
        </div>
        <div className="rounded-[8px] border border-white/10 bg-white/[0.06] p-5 sm:p-7">
          <EventForm event={event} />
        </div>
      </section>
    </AdminShell>
  );
}
