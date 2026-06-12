"use client";

import { useActionState, useMemo, useState } from "react";
import type { EventInput } from "@sfvypaa/content";

import {
  deleteEventAction,
  saveEventAction,
  type AdminActionState,
} from "@/app/actions";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import {
  DateField,
  Field,
  FieldError,
  FieldGroup,
  FormMessage,
  ImageUploadField,
  PublishingActions,
  SelectField,
  TextArea,
} from "@/components/form-fields";
import { Input } from "@/components/ui/input";

const initialState: AdminActionState = null;

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
    <form action={formAction} className="grid gap-5 pb-16">
      <FormMessage message={state?.message} />
      <input type="hidden" name="id" value={event.id ?? ""} />

      <FieldGroup title="Basics">
        <Field
          label="Title"
          name="title"
          defaultValue={event.title}
          error={fieldErrors.title}
          required
        />
        <div className="grid gap-4.5 md:grid-cols-2">
          <LocationField
            defaultValue={event.location}
            error={fieldErrors.location}
            suggestions={locationSuggestions}
          />
          <SelectField
            label="Host"
            name="host"
            defaultValue={event.host}
            options={["Hosted by SFVYPAA", "Co-hosted by SFVYPAA"]}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="When">
        <div className="grid gap-4.5 md:grid-cols-2">
          <DateField
            defaultValue={eventDate}
            error={fieldErrors.eventDate}
            label="Date"
            name="eventDate"
          />
          <Field
            label="Time"
            name="time"
            defaultValue={event.time}
            error={fieldErrors.time}
            mono
            required
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Content">
        <TextArea
          label="Summary"
          name="tone"
          defaultValue={event.tone}
          error={fieldErrors.tone}
          required
        />
        <Field
          label="RSVP URL"
          name="rsvpUrl"
          defaultValue={event.rsvpUrl}
          error={fieldErrors.rsvpUrl}
          mono
          placeholder="https://example.com"
          type="url"
        />
      </FieldGroup>

      <FieldGroup title="Flyer">
        <ImageUploadField
          defaultValue={event.imageUrl}
          error={fieldErrors.imageFile || fieldErrors.imageUrl}
          label="Event flyer (optional)"
        />
      </FieldGroup>

      <PublishingActions
        isPending={isPending}
        isPublished={isPublished}
        publicHref={`${publicSiteUrl}/upcoming-events`}
      />
    </form>
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
      <label className="label-stamp text-foreground" htmlFor="event-location">
        Location
      </label>
      <Input
        aria-controls={listboxId}
        aria-describedby={errorId}
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        autoComplete="off"
        className="h-11"
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
          className="absolute top-[calc(100%+0.5rem)] left-0 z-20 w-full overflow-hidden border-[3px] border-border bg-card py-1 text-foreground shadow-stamp-lg"
          id={listboxId}
          role="listbox"
        >
          {filteredSuggestions.map((suggestion) => (
            <button
              className="block w-full px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-secondary"
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
