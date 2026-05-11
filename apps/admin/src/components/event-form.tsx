"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { EventInput } from "@sfvypaa/content";
import { format } from "date-fns";
import { CalendarDays, ExternalLink, ImageIcon, Upload, X } from "lucide-react";

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
const maxImageSize = 6 * 1024 * 1024;
const acceptedImageTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function EventForm({
  event,
  locationSuggestions,
  publicSiteUrl,
}: {
  event: EventInput;
  locationSuggestions: string[];
  publicSiteUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(
    saveEventAction,
    initialState,
  );
  const eventDate = event.eventDate || event.sortDate;
  const fieldErrors = state?.fieldErrors ?? {};
  const isPublished = event.status === "published";

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
      <Field
        label="Title"
        name="title"
        defaultValue={event.title}
        error={fieldErrors.title}
        required
      />
      <div className="grid gap-5 md:grid-cols-2">
        <DateField defaultValue={eventDate} error={fieldErrors.eventDate} />
        <Field
          label="Time"
          name="time"
          defaultValue={event.time}
          error={fieldErrors.time}
          required
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <LocationField
          defaultValue={event.location}
          error={fieldErrors.location}
          suggestions={locationSuggestions}
        />
        <Select
          label="Host"
          name="host"
          defaultValue={event.host}
          options={["Hosted by SFVYPAA", "Co-hosted by SFVYPAA"]}
        />
      </div>
      <TextArea
        label="Summary"
        name="tone"
        defaultValue={event.tone}
        error={fieldErrors.tone}
        required
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="RSVP URL"
          name="rsvpUrl"
          defaultValue={event.rsvpUrl}
          error={fieldErrors.rsvpUrl}
          placeholder="https://example.com"
          type="url"
        />
        <ImageUploadField
          defaultValue={event.imageUrl}
          error={fieldErrors.imageFile || fieldErrors.imageUrl}
        />
      </div>
      <PublishingActions
        isPending={isPending}
        isPublished={isPublished}
        publicHref={`${publicSiteUrl}/upcoming-events`}
      />
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

function DateField({
  defaultValue,
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() =>
    dateFromIso(defaultValue),
  );
  const isoValue = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const errorId = error ? "event-date-error" : undefined;

  return (
    <div className="relative grid gap-2">
      <span className="text-sm font-semibold text-white/72" id="event-date-label">
        Date
      </span>
      <input type="hidden" name="eventDate" value={isoValue} readOnly />
      <Button
        aria-describedby={errorId}
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        aria-labelledby="event-date-label"
        className={cn(
          "h-11 justify-between rounded-[8px] border-white/15 bg-white px-3 text-[#171310]",
          "hover:bg-[#f5eee5] hover:text-[#171310]",
        )}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
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
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

function LocationField({
  defaultValue,
  error,
  suggestions,
}: {
  defaultValue?: string;
  error?: string;
  suggestions: string[];
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const errorId = error ? "event-location-error" : undefined;
  const listboxId = "event-location-options";
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
        aria-controls={listboxId}
        aria-describedby={errorId}
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
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
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        required
        role="combobox"
        value={value}
      />
      {isOpen && filteredSuggestions.length > 0 ? (
        <div
          className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-full overflow-hidden rounded-[8px] border border-[#171310]/10 bg-white py-1 text-[#171310] shadow-xl"
          id={listboxId}
          role="listbox"
        >
          {filteredSuggestions.map((suggestion) => (
            <button
              className="block w-full px-3 py-2 text-left text-sm font-medium transition hover:bg-[#f5eee5]"
              key={suggestion}
              onMouseDown={(event) => {
                event.preventDefault();
                setValue(suggestion);
                setIsOpen(false);
              }}
              aria-selected={suggestion === value}
              role="option"
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

function ImageUploadField({
  defaultValue,
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  const [clientError, setClientError] = useState("");
  const [isRemoved, setIsRemoved] = useState(false);
  const [objectUrl, setObjectUrl] = useState("");

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const previewUrl = objectUrl || (isRemoved ? "" : defaultValue || "");
  const displayError = clientError || error;
  const errorId = displayError ? "event-image-error" : undefined;

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">Image</span>
      <input
        name="existingImageUrl"
        type="hidden"
        value={isRemoved ? "" : defaultValue ?? ""}
        readOnly
      />
      <div className="grid gap-3 rounded-[8px] border border-white/15 bg-white p-3 text-[#171310] sm:grid-cols-[8rem_1fr]">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[8px] bg-[#f5eee5]">
          {previewUrl ? (
            <Image
              alt="Event flyer preview"
              className="object-cover"
              fill
              sizes="8rem"
              src={previewUrl}
              unoptimized
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
            aria-describedby={errorId}
            aria-invalid={Boolean(displayError)}
            className="h-11 cursor-pointer rounded-[8px] border-[#171310]/15 bg-[#fbfaf8] px-3 text-[#171310]"
            name="imageFile"
            onChange={(event) => {
              const file = event.target.files?.[0];

              setClientError("");

              if (!file) {
                setObjectUrl("");
                return;
              }

              if (!acceptedImageTypes.has(file.type)) {
                event.currentTarget.value = "";
                setObjectUrl("");
                setClientError("Upload a PNG, JPG, GIF, or WebP image.");
                return;
              }

              if (file.size > maxImageSize) {
                event.currentTarget.value = "";
                setObjectUrl("");
                setClientError("Image must be 6 MB or smaller.");
                return;
              }

              setIsRemoved(false);
              setObjectUrl(URL.createObjectURL(file));
            }}
            type="file"
          />
          <p className="text-xs leading-5 text-[#6f655b]">
            PNG, JPG, GIF, or WebP. Maximum 6 MB.
          </p>
          {previewUrl ? (
            <Button
              className="h-9 w-fit rounded-[8px] border-[#171310]/15 px-3 text-[#171310] hover:bg-[#f5eee5]"
              onClick={() => {
                setIsRemoved(true);
                setObjectUrl("");
                setClientError("");
              }}
              type="button"
              variant="outline"
            >
              <X className="size-4" />
              Remove image
            </Button>
          ) : null}
          {displayError ? (
            <FieldError id={errorId} tone="dark">
              {displayError}
            </FieldError>
          ) : null}
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
  error,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  type?: string;
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <Input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="h-11 rounded-[8px] border-white/15 bg-white px-3 text-[#171310]"
      />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  error,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <textarea
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={5}
        className="min-h-32 w-full rounded-[8px] border border-white/15 bg-white px-3 py-3 text-base leading-7 text-[#171310] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </label>
  );
}

function PublishingActions({
  isPending,
  isPublished,
  publicHref,
}: {
  isPending: boolean;
  isPublished: boolean;
  publicHref: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-5 border-t border-white/10 bg-[#171310]/95 p-4 backdrop-blur sm:-mx-7 sm:px-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm leading-6 text-white/58">
          {isPublished
            ? "Publishing updates the live event listing."
            : "Drafts stay private until you publish them."}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {isPublished ? (
            <>
              <Button
                className="h-11 rounded-[8px] bg-[#ffcf6b] px-5 text-[#191109] hover:bg-[#f3b83f]"
                disabled={isPending}
                name="intent"
                type="submit"
                value="publish"
              >
                {isPending ? "Saving..." : "Update published"}
              </Button>
              <Button
                className="h-11 rounded-[8px] border-white/20 bg-white/10 px-4 text-white hover:bg-white/20"
                disabled={isPending}
                name="intent"
                type="submit"
                value="save-draft"
                variant="outline"
              >
                {isPending ? "Saving..." : "Move to draft"}
              </Button>
            </>
          ) : (
            <>
              <Button
                className="h-11 rounded-[8px] border-white/20 bg-white/10 px-4 text-white hover:bg-white/20"
                disabled={isPending}
                name="intent"
                type="submit"
                value="save-draft"
                variant="outline"
              >
                {isPending ? "Saving..." : "Save draft"}
              </Button>
              <Button
                className="h-11 rounded-[8px] bg-[#ffcf6b] px-5 text-[#191109] hover:bg-[#f3b83f]"
                disabled={isPending}
                name="intent"
                type="submit"
                value="publish"
              >
                {isPending ? "Publishing..." : "Publish"}
              </Button>
            </>
          )}
          {isPublished ? (
            <Button
              className="h-11 rounded-[8px] border-white/20 bg-transparent px-4 text-white hover:bg-white/10"
              nativeButton={false}
              render={<a href={publicHref} rel="noreferrer" target="_blank" />}
              variant="outline"
            >
              Preview public page
              <ExternalLink className="size-4" />
            </Button>
          ) : (
            <span className="inline-flex h-11 items-center justify-center rounded-[8px] border border-white/10 px-4 text-sm font-medium text-white/40">
              Preview after publish
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldError({
  children,
  id,
  tone = "light",
}: {
  children: React.ReactNode;
  id?: string;
  tone?: "light" | "dark";
}) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "text-sm font-medium",
        tone === "dark" ? "text-red-700" : "text-red-100",
      )}
      id={id}
    >
      {children}
    </p>
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
