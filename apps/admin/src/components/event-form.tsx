"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { EventInput } from "@sfvypaa/content";
import { format } from "date-fns";
import { CalendarDays, ImageIcon, Upload } from "lucide-react";

import {
  deleteEventAction,
  saveEventAction,
  type AdminActionState,
} from "@/app/actions";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: AdminActionState = null;

export function EventForm({
  event,
  locationSuggestions,
}: {
  event: EventInput;
  locationSuggestions: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    saveEventAction,
    initialState,
  );
  const eventDate = event.eventDate || event.sortDate;

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
      <input type="hidden" name="id" value={event.id ?? ""} />
      <Field label="Title" name="title" defaultValue={event.title} required />
      <div className="grid gap-5 md:grid-cols-2">
        <DateField defaultValue={eventDate} />
        <Field label="Time" name="time" defaultValue={event.time} required />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <LocationField
          defaultValue={event.location}
          suggestions={locationSuggestions}
        />
        <Select
          label="Host"
          name="host"
          defaultValue={event.host}
          options={["Hosted by SFVYPAA", "Co-hosted by SFVYPAA"]}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Select
          label="Status"
          name="status"
          defaultValue={event.status}
          options={["draft", "published"]}
        />
      </div>
      <TextArea label="Summary" name="tone" defaultValue={event.tone} required />
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="RSVP URL"
          name="rsvpUrl"
          defaultValue={event.rsvpUrl}
          placeholder="https://example.com"
          type="url"
        />
        <ImageUploadField defaultValue={event.imageUrl} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-[8px] bg-[#ffcf6b] px-5 text-[#191109] hover:bg-[#f3b83f]"
        >
          {isPending ? "Saving..." : "Save event"}
        </Button>
      </div>
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

  return (
    <div className="relative grid gap-2">
      <span className="text-sm font-semibold text-white/72">Date</span>
      <input type="hidden" name="eventDate" value={isoValue} readOnly />
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
        <span>
          {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select date"}
        </span>
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

function LocationField({
  defaultValue,
  suggestions,
}: {
  defaultValue?: string;
  suggestions: string[];
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const filteredSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    return suggestions
      .filter((suggestion) =>
        query ? suggestion.toLowerCase().includes(query) : true,
      )
      .filter((suggestion) => suggestion !== value)
      .slice(0, 6);
  }, [suggestions, value]);

  return (
    <div className="relative grid gap-2">
      <label
        className="text-sm font-semibold text-white/72"
        htmlFor="event-location"
      >
        Location
      </label>
      <Input
        autoComplete="off"
        className="h-11 rounded-[8px] border-white/15 bg-white px-3 text-[#171310]"
        id="event-location"
        name="location"
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        onChange={(event) => {
          setValue(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        required
        value={value}
      />
      {isOpen && filteredSuggestions.length > 0 ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-full overflow-hidden rounded-[8px] border border-[#171310]/10 bg-white py-1 text-[#171310] shadow-xl">
          {filteredSuggestions.map((suggestion) => (
            <button
              className="block w-full px-3 py-2 text-left text-sm font-medium transition hover:bg-[#f5eee5]"
              key={suggestion}
              onMouseDown={(event) => {
                event.preventDefault();
                setValue(suggestion);
                setIsOpen(false);
              }}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ImageUploadField({ defaultValue }: { defaultValue?: string }) {
  const [objectUrl, setObjectUrl] = useState("");

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const previewUrl = objectUrl || defaultValue || "";

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">Image</span>
      <input
        name="existingImageUrl"
        type="hidden"
        value={defaultValue ?? ""}
        readOnly
      />
      <div className="grid gap-3 rounded-[8px] border border-white/15 bg-white p-3 text-[#171310] sm:grid-cols-[8rem_1fr]">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[8px] bg-[#f5eee5]">
          {previewUrl ? (
            <img
              alt="Event flyer preview"
              className="size-full object-cover"
              src={previewUrl}
            />
          ) : (
            <ImageIcon className="size-8 text-[#8a7f75]" />
          )}
        </div>
        <div className="grid content-center gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Upload className="size-4 text-[#d94b2b]" />
            Upload event image
          </div>
          <Input
            accept="image/gif,image/jpeg,image/png,image/webp"
            className="h-11 cursor-pointer rounded-[8px] border-[#171310]/15 bg-[#fbfaf8] px-3 text-[#171310]"
            name="imageFile"
            onChange={(event) => {
              const file = event.target.files?.[0];

              setObjectUrl(file ? URL.createObjectURL(file) : "");
            }}
            type="file"
          />
        </div>
      </div>
    </label>
  );
}

export function DeleteEventForm({ id, title }: { id: string; title: string }) {
  return (
    <DeleteConfirmationDialog
      action={deleteEventAction}
      id={id}
      resourceName={title}
      resourceType="event"
    />
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <Input
        name={name}
        type={type}
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
