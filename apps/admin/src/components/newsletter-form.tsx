"use client";

import { useActionState, useState } from "react";
import type { NewsletterInput } from "@sfvypaa/content";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

import {
  deleteNewsletterAction,
  saveNewsletterAction,
  type AdminActionState,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: AdminActionState = null;

export function NewsletterForm({
  newsletter,
}: {
  newsletter: NewsletterInput;
}) {
  const [state, formAction, isPending] = useActionState(
    saveNewsletterAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5">
      {state?.message ? (
        <p
          aria-live="polite"
          className="rounded-[8px] border border-red-400/40 bg-red-950/50 px-4 py-3 text-sm font-medium text-red-100"
        >
          {state.message}
        </p>
      ) : null}
      <input type="hidden" name="id" value={newsletter.id ?? ""} />
      <Field label="Title" name="title" defaultValue={newsletter.title} required />
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="URL slug"
          name="slug"
          defaultValue={newsletter.slug}
          placeholder="auto-generated from title"
        />
        <DateField defaultValue={newsletter.publishDate} />
      </div>
      <Select
        label="Status"
        name="status"
        defaultValue={newsletter.status}
        options={["draft", "published"]}
      />
      <TextArea
        label="Excerpt"
        name="excerpt"
        defaultValue={newsletter.excerpt}
        required
        rows={3}
      />
      <TextArea
        label="Body"
        name="body"
        defaultValue={newsletter.body}
        required
        rows={14}
      />
      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-fit rounded-[8px] bg-[#ffcf6b] px-5 text-[#191109] hover:bg-[#f3b83f]"
      >
        {isPending ? "Saving..." : "Save newsletter"}
      </Button>
    </form>
  );
}

function dateFromIso(value?: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");

  if (!match) {
    return undefined;
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function DateField({ defaultValue }: { defaultValue?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() =>
    dateFromIso(defaultValue),
  );
  const isoValue = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const displayValue = selectedDate
    ? format(selectedDate, "MMMM d, yyyy")
    : defaultValue || "Select date";

  return (
    <div className="relative grid gap-2">
      <span className="text-sm font-semibold text-white/72">Publish date</span>
      <input
        type="hidden"
        name="publishDate"
        value={isoValue || defaultValue || ""}
        readOnly
      />
      <Button
        aria-expanded={isOpen}
        className={cn(
          "h-11 justify-between rounded-[8px] border-white/15 bg-white px-3 text-[#171310]",
          "hover:bg-[#f5eee5] hover:text-[#171310]",
        )}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
        variant="outline"
      >
        <span>{displayValue}</span>
        <CalendarDays className="size-4 text-[#d94b2b]" />
      </Button>
      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-full min-w-[18rem] rounded-[8px] border border-[#171310]/10 bg-white shadow-xl">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
                setIsOpen(false);
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function DeleteNewsletterForm({ id }: { id: string }) {
  return (
    <form action={deleteNewsletterAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="destructive"
        className="h-10 rounded-[8px] px-4"
      >
        Delete newsletter
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <Input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
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
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  rows: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={rows}
        className="w-full rounded-[8px] border border-white/15 bg-white px-3 py-3 text-base leading-7 text-[#171310] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
