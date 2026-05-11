"use server";

import {
  deleteEvent,
  deleteNewsletter,
  eventInputSchema,
  newsletterInputSchema,
  saveEvent,
  saveNewsletter,
  uploadEventImage,
  type EventHost,
  type EventInput,
  type ContentStatus,
  type NewsletterInput,
} from "@sfvypaa/content";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AdminActionState = {
  message: string;
} | null;

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function status(formData: FormData): ContentStatus {
  return field(formData, "status") === "published" ? "published" : "draft";
}

function host(formData: FormData): EventHost {
  return field(formData, "host") === "Co-hosted by SFVYPAA"
    ? "Co-hosted by SFVYPAA"
    : "Hosted by SFVYPAA";
}

function eventDateLabel(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return "";
  }

  const [, year, month, day] = match;
  return format(
    new Date(Number(year), Number(month) - 1, Number(day)),
    "MMMM d, yyyy",
  );
}

function uploadedImage(formData: FormData) {
  const value = formData.get("imageFile");

  if (
    value instanceof File &&
    value.size > 0 &&
    value.name.trim().length > 0
  ) {
    return value;
  }

  return null;
}

function validationMessage(error: {
  issues: Array<{ path: Array<PropertyKey>; message: string }>;
}) {
  const firstIssue = error.issues[0];

  if (!firstIssue) {
    return "Check the form fields and try again.";
  }

  const fieldName = firstIssue.path.map(String).join(".");

  return fieldName
    ? `${fieldName}: ${firstIssue.message}`
    : firstIssue.message;
}

function saveErrorMessage(error: unknown) {
  if (
    error instanceof Error &&
    error.message === "Firebase Admin env vars are not configured."
  ) {
    return "Firebase is not configured locally. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY, then restart the admin server.";
  }

  return error instanceof Error
    ? error.message
    : "Unable to save. Check the form fields and try again.";
}

function eventInput(formData: FormData): EventInput {
  const eventDate = field(formData, "eventDate");

  return {
    id: field(formData, "id") || undefined,
    title: field(formData, "title"),
    eventDate,
    date: eventDateLabel(eventDate),
    time: field(formData, "time"),
    location: field(formData, "location"),
    tone: field(formData, "tone"),
    host: host(formData),
    status: status(formData),
    sortDate: "",
    rsvpUrl: field(formData, "rsvpUrl"),
    imageUrl: field(formData, "existingImageUrl"),
  };
}

function newsletterInput(formData: FormData): NewsletterInput {
  return {
    id: field(formData, "id") || undefined,
    title: field(formData, "title"),
    slug: field(formData, "slug"),
    excerpt: field(formData, "excerpt"),
    body: field(formData, "body"),
    publishDate: field(formData, "publishDate"),
    status: status(formData),
  };
}

export async function saveEventAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = eventInputSchema.safeParse(eventInput(formData));

  if (!parsed.success) {
    return { message: validationMessage(parsed.error) };
  }

  let id: string;

  try {
    const image = uploadedImage(formData);
    const data = image
      ? {
          ...parsed.data,
          imageUrl: await uploadEventImage(image, parsed.data.title),
        }
      : parsed.data;

    id = await saveEvent(data);
  } catch (error) {
    return { message: saveErrorMessage(error) };
  }

  revalidatePath("/events");
  revalidatePath("/upcoming-events");
  redirect(`/events/${id}`);
}

export async function deleteEventAction(formData: FormData) {
  const id = field(formData, "id");

  if (id) {
    await deleteEvent(id);
  }

  revalidatePath("/events");
  revalidatePath("/upcoming-events");
  redirect("/events");
}

export async function saveNewsletterAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = newsletterInputSchema.safeParse(newsletterInput(formData));

  if (!parsed.success) {
    return { message: validationMessage(parsed.error) };
  }

  let id: string;

  try {
    id = await saveNewsletter(parsed.data);
  } catch (error) {
    return { message: saveErrorMessage(error) };
  }

  revalidatePath("/newsletters");
  redirect(`/newsletters/${id}`);
}

export async function deleteNewsletterAction(formData: FormData) {
  const id = field(formData, "id");

  if (id) {
    await deleteNewsletter(id);
  }

  revalidatePath("/newsletters");
  redirect("/newsletters");
}
