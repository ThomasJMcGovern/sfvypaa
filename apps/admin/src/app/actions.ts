"use server";

import {
  deleteEvent,
  deleteNewsletter,
  saveEvent,
  saveNewsletter,
  type EventHost,
  type ContentStatus,
} from "@sfvypaa/content";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function saveEventAction(formData: FormData) {
  const id = await saveEvent({
    id: field(formData, "id") || undefined,
    title: field(formData, "title"),
    date: field(formData, "date"),
    time: field(formData, "time"),
    location: field(formData, "location"),
    tone: field(formData, "tone"),
    host: host(formData),
    status: status(formData),
    sortDate: field(formData, "sortDate"),
    rsvpUrl: field(formData, "rsvpUrl"),
    imageUrl: field(formData, "imageUrl"),
  });

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

export async function saveNewsletterAction(formData: FormData) {
  const id = await saveNewsletter({
    id: field(formData, "id") || undefined,
    title: field(formData, "title"),
    slug: field(formData, "slug"),
    excerpt: field(formData, "excerpt"),
    body: field(formData, "body"),
    publishDate: field(formData, "publishDate"),
    status: status(formData),
  });

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
