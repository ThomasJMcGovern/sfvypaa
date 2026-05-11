import type { EventInput } from "@sfvypaa/content";

import { deleteEventAction, saveEventAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EventForm({ event }: { event: EventInput }) {
  return (
    <form action={saveEventAction} className="grid gap-5">
      <input type="hidden" name="id" value={event.id ?? ""} />
      <Field label="Title" name="title" defaultValue={event.title} required />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Date label" name="date" defaultValue={event.date} required />
        <Field label="Sort date" name="sortDate" defaultValue={event.sortDate} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Time" name="time" defaultValue={event.time} required />
        <Field
          label="Location"
          name="location"
          defaultValue={event.location}
          required
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Select
          label="Host"
          name="host"
          defaultValue={event.host}
          options={["Hosted by SFVYPAA", "Co-hosted by SFVYPAA"]}
        />
        <Select
          label="Status"
          name="status"
          defaultValue={event.status}
          options={["draft", "published"]}
        />
      </div>
      <TextArea label="Summary" name="tone" defaultValue={event.tone} required />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="RSVP URL" name="rsvpUrl" defaultValue={event.rsvpUrl} />
        <Field label="Image URL" name="imageUrl" defaultValue={event.imageUrl} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          className="h-11 rounded-[8px] bg-[#ffcf6b] px-5 text-[#191109] hover:bg-[#f3b83f]"
        >
          Save event
        </Button>
      </div>
    </form>
  );
}

export function DeleteEventForm({ id }: { id: string }) {
  return (
    <form action={deleteEventAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="destructive"
        className="h-10 rounded-[8px] px-4"
      >
        Delete event
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <Input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="h-11 rounded-[8px] border-white/15 bg-white px-3 text-[#171310]"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={5}
        className="min-h-32 w-full rounded-[8px] border border-white/15 bg-white px-3 py-3 text-base leading-7 text-[#171310] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-11 rounded-[8px] border border-white/15 bg-white px-3 text-[#171310] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
