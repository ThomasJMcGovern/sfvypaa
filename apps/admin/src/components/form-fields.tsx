"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  CalendarDays,
  ExternalLink,
  ImageUp,
  Save,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* Shared punk form pieces for the admin editors. All committee data fields
   stay mono + AA-legible — the grit lives in the frame. */

export function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-[3px] border-border bg-card p-6 text-card-foreground shadow-stamp">
      <h2 className="mb-5 text-2xl leading-none text-foreground">{title}</h2>
      <div className="flex flex-col gap-4.5">{children}</div>
    </section>
  );
}

export function FieldError({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <p aria-live="polite" className="text-sm font-bold text-stop" id={id}>
      {children}
    </p>
  );
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className="border-2 border-stop border-l-8 bg-card px-4 py-3 text-sm font-bold text-stop"
    >
      {message}
    </p>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  error,
  type = "text",
  mono = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  type?: string;
  mono?: boolean;
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label className="grid gap-2">
      <span className="label-stamp text-foreground">{label}</span>
      <Input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={cn("h-11", mono && "font-mono")}
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  error,
  required,
  rows = 5,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  rows?: number;
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label className="grid gap-2">
      <span className="label-stamp text-foreground">{label}</span>
      <textarea
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className="w-full rounded-[2px] border-2 border-input bg-card px-3 py-3 text-base leading-7 font-medium text-foreground transition-[box-shadow] duration-100 outline-none focus-visible:shadow-[3px_3px_0_0_var(--ring)]"
        defaultValue={defaultValue}
        name={name}
        required={required}
        rows={rows}
      />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </label>
  );
}

export function SelectField({
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
      <span className="label-stamp text-foreground">{label}</span>
      <select
        className="h-11 rounded-[2px] border-2 border-input bg-card px-3 font-medium text-foreground outline-none focus-visible:shadow-[3px_3px_0_0_var(--ring)]"
        defaultValue={defaultValue}
        name={name}
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

function dateFromIso(value?: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");

  if (!match) {
    return undefined;
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function DateField({
  label,
  name,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() =>
    dateFromIso(defaultValue),
  );
  const isoValue = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const labelId = `${name}-label`;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className="relative grid gap-2">
      <span className="label-stamp text-foreground" id={labelId}>
        {label}
      </span>
      <input
        name={name}
        readOnly
        type="hidden"
        value={isoValue || defaultValue || ""}
      />
      <Button
        aria-describedby={errorId}
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        aria-labelledby={labelId}
        className="h-11 w-full justify-between font-mono tracking-normal normal-case"
        onClick={() => setIsOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        type="button"
        variant="outline"
      >
        <span>
          {selectedDate
            ? format(selectedDate, "MMMM d, yyyy")
            : defaultValue || "Select date"}
        </span>
        <CalendarDays className="size-4 text-orange" />
      </Button>
      {isOpen ? (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 z-30 w-full min-w-[18rem] border-[3px] border-border bg-card shadow-stamp-lg">
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

const maxImageSize = 6 * 1024 * 1024;
const acceptedImageTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function ImageUploadField({
  label,
  defaultValue,
  error,
  aspect = "4/3",
}: {
  label: string;
  defaultValue?: string;
  error?: string;
  aspect?: "4/3" | "1/1";
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
  const errorId = displayError ? "image-upload-error" : undefined;

  return (
    <label className="grid gap-2">
      <span className="label-stamp text-foreground">{label}</span>
      <input
        name="existingImageUrl"
        type="hidden"
        value={isRemoved ? "" : (defaultValue ?? "")}
        readOnly
      />
      <div className="grid gap-3 border-2 border-dashed border-border bg-secondary p-3 text-foreground sm:grid-cols-[8rem_1fr]">
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden border-2 border-border bg-card",
            aspect === "1/1" ? "aspect-square" : "aspect-[4/3]"
          )}
        >
          {previewUrl ? (
            <Image
              alt="Image preview"
              className="object-cover"
              fill
              sizes="8rem"
              src={previewUrl}
              unoptimized
            />
          ) : (
            <ImageUp className="size-7 text-muted-foreground" />
          )}
        </div>
        <div className="grid content-center gap-2">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Upload className="size-4 text-orange" />
            Drop an image here, or click to upload
          </div>
          <Input
            accept="image/gif,image/jpeg,image/png,image/webp"
            aria-describedby={errorId}
            aria-invalid={Boolean(displayError)}
            className="h-11 cursor-pointer"
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
          <p className="font-mono text-xs leading-5 text-muted-foreground">
            PNG / JPG / GIF / WebP · max 6 MB · halftoned on the public site
          </p>
          {previewUrl ? (
            <Button
              className="w-fit"
              onClick={() => {
                setIsRemoved(true);
                setObjectUrl("");
                setClientError("");
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              <X data-icon="inline-start" />
              Remove image
            </Button>
          ) : null}
          {displayError ? (
            <FieldError id={errorId}>{displayError}</FieldError>
          ) : null}
        </div>
      </div>
    </label>
  );
}

export function PublishingActions({
  isPending,
  isPublished,
  publicHref,
}: {
  isPending: boolean;
  isPublished: boolean;
  publicHref?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 border-t-[3px] border-orange bg-ink px-5 py-3.5 text-bone">
      <div className="flex flex-wrap items-center gap-3.5">
        <span className="inline-flex items-center gap-2">
          <span
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              isPublished ? "bg-go" : "bg-[#EBC25A]"
            )}
          />
          <span className="font-mono text-[13px] font-bold">
            {isPublished ? "Live on the public site" : "Draft — not yet public"}
          </span>
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <Button
            className="border-bone/40 text-bone shadow-none hover:bg-bone/10 hover:shadow-none active:shadow-none"
            disabled={isPending}
            name="intent"
            size="sm"
            type="submit"
            value="save-draft"
            variant="outline"
          >
            <Save data-icon="inline-start" />
            {isPending ? "Saving…" : isPublished ? "Unpublish" : "Save draft"}
          </Button>
          <Button
            disabled={isPending}
            name="intent"
            size="sm"
            type="submit"
            value="publish"
          >
            <Upload data-icon="inline-start" />
            {isPending
              ? "Publishing…"
              : isPublished
                ? "Update published"
                : "Publish to site"}
          </Button>
          {isPublished && publicHref ? (
            <a
              className="inline-flex items-center gap-1.5 border-2 border-bone/40 px-2.5 py-1.5 font-mono text-xs font-bold tracking-wider text-bone uppercase transition-colors hover:bg-bone/10"
              href={publicHref}
              rel="noreferrer"
              target="_blank"
            >
              View live <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
