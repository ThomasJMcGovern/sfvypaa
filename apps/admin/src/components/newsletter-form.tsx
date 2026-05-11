"use client";

import { useActionState, useState } from "react";
import type { NewsletterInput } from "@sfvypaa/content";
import { format } from "date-fns";
import { CalendarDays, ExternalLink } from "lucide-react";

import {
  deleteNewsletterAction,
  saveNewsletterAction,
  type AdminActionState,
} from "@/app/actions";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: AdminActionState = null;

export function NewsletterForm({
  newsletter,
  publicSiteUrl,
}: {
  newsletter: NewsletterInput;
  publicSiteUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(
    saveNewsletterAction,
    initialState,
  );
  const fieldErrors = state?.fieldErrors ?? {};
  const previewSlug = slugifyForPath(newsletter.slug || newsletter.title);
  const isPublished = newsletter.status === "published";

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
      <Field
        label="Title"
        name="title"
        defaultValue={newsletter.title}
        error={fieldErrors.title}
        required
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="URL slug"
          name="slug"
          defaultValue={newsletter.slug}
          error={fieldErrors.slug}
          placeholder="auto-generated from title"
        />
        <DateField
          defaultValue={newsletter.publishDate}
          error={fieldErrors.publishDate}
        />
      </div>
      <TextArea
        label="Excerpt"
        name="excerpt"
        defaultValue={newsletter.excerpt}
        error={fieldErrors.excerpt}
        required
        rows={3}
      />
      <TextArea
        label="Body"
        name="body"
        defaultValue={newsletter.body}
        error={fieldErrors.body}
        required
        rows={14}
      />
      <PublishingActions
        isPending={isPending}
        isPublished={isPublished}
        publicHref={
          previewSlug ? `${publicSiteUrl}/newsletters/${previewSlug}` : ""
        }
      />
    </form>
  );
}

function slugifyForPath(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  const displayValue = selectedDate
    ? format(selectedDate, "MMMM d, yyyy")
    : defaultValue || "Select date";
  const errorId = error ? "newsletter-publish-date-error" : undefined;

  return (
    <div className="relative grid gap-2">
      <span
        className="text-sm font-semibold text-white/72"
        id="newsletter-publish-date-label"
      >
        Publish date
      </span>
      <input
        type="hidden"
        name="publishDate"
        value={isoValue || defaultValue || ""}
        readOnly
      />
      <Button
        aria-describedby={errorId}
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        aria-labelledby="newsletter-publish-date-label"
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
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

export function DeleteNewsletterForm({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <DeleteConfirmationDialog
      action={deleteNewsletterAction}
      id={id}
      resourceName={title}
      resourceType="newsletter"
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
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <Input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        name={name}
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
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  rows: number;
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
        rows={rows}
        className="w-full rounded-[8px] border border-white/15 bg-white px-3 py-3 text-base leading-7 text-[#171310] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
  const canPreview = isPublished && publicHref;

  return (
    <div className="sticky bottom-0 z-10 -mx-5 border-t border-white/10 bg-[#171310]/95 p-4 backdrop-blur sm:-mx-7 sm:px-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm leading-6 text-white/58">
          {isPublished
            ? "Publishing updates the public newsletter archive."
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
          {canPreview ? (
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
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <p aria-live="polite" className="text-sm font-medium text-red-100" id={id}>
      {children}
    </p>
  );
}
