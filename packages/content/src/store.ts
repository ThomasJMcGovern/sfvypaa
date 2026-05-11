import { FieldValue, type QueryDocumentSnapshot } from "firebase-admin/firestore";

import { getAdminDb, isFirebaseConfigured } from "./firebase";
import {
  eventInputSchema,
  type EventInput,
  type EventRecord,
  newsletterInputSchema,
  type NewsletterInput,
  type NewsletterRecord,
} from "./schema";

const eventsCollection = "events";
const newslettersCollection = "newsletters";

type FirestoreTimestampLike = {
  toDate?: () => Date;
  seconds?: number;
};

function toIsoString(value: unknown) {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const timestamp = value as FirestoreTimestampLike;

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toISOString();
  }

  if (typeof timestamp.seconds === "number") {
    return new Date(timestamp.seconds * 1000).toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

function cleanOptionalUrl(value: string | undefined) {
  return value && value.length > 0 ? value : "";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function eventFromDoc(doc: QueryDocumentSnapshot): EventRecord {
  const data = doc.data();

  return {
    id: doc.id,
    title: String(data.title ?? ""),
    date: String(data.date ?? ""),
    time: String(data.time ?? ""),
    location: String(data.location ?? ""),
    tone: String(data.tone ?? ""),
    host:
      data.host === "Co-hosted by SFVYPAA"
        ? "Co-hosted by SFVYPAA"
        : "Hosted by SFVYPAA",
    status: data.status === "published" ? "published" : "draft",
    sortDate: typeof data.sortDate === "string" ? data.sortDate : "",
    rsvpUrl: typeof data.rsvpUrl === "string" ? data.rsvpUrl : "",
    imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : "",
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    publishedAt: toIsoString(data.publishedAt),
  };
}

function newsletterFromDoc(doc: QueryDocumentSnapshot): NewsletterRecord {
  const data = doc.data();

  return {
    id: doc.id,
    title: String(data.title ?? ""),
    slug: String(data.slug ?? doc.id),
    excerpt: String(data.excerpt ?? ""),
    body: String(data.body ?? ""),
    publishDate: String(data.publishDate ?? ""),
    status: data.status === "published" ? "published" : "draft",
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    publishedAt: toIsoString(data.publishedAt),
  };
}

function byEventDate(a: EventRecord, b: EventRecord) {
  return (a.sortDate || a.date).localeCompare(b.sortDate || b.date);
}

function byNewsletterDate(a: NewsletterRecord, b: NewsletterRecord) {
  return b.publishDate.localeCompare(a.publishDate);
}

export async function listEvents() {
  if (!isFirebaseConfigured()) {
    return [];
  }

  const snapshot = await getAdminDb().collection(eventsCollection).get();
  return snapshot.docs.map(eventFromDoc).sort(byEventDate);
}

export async function listPublishedEvents() {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const snapshot = await getAdminDb()
      .collection(eventsCollection)
      .where("status", "==", "published")
      .get();

    return snapshot.docs.map(eventFromDoc).sort(byEventDate);
  } catch {
    return [];
  }
}

export async function getEvent(id: string) {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const doc = await getAdminDb().collection(eventsCollection).doc(id).get();

  return doc.exists
    ? eventFromDoc(doc as QueryDocumentSnapshot)
    : null;
}

export async function saveEvent(input: EventInput) {
  const parsed = eventInputSchema.parse(input);
  const db = getAdminDb();
  const ref = parsed.id
    ? db.collection(eventsCollection).doc(parsed.id)
    : db.collection(eventsCollection).doc();

  const existing = await ref.get();
  const data = {
    title: parsed.title,
    date: parsed.date,
    time: parsed.time,
    location: parsed.location,
    tone: parsed.tone,
    host: parsed.host,
    status: parsed.status,
    sortDate: parsed.sortDate ?? "",
    rsvpUrl: cleanOptionalUrl(parsed.rsvpUrl),
    imageUrl: cleanOptionalUrl(parsed.imageUrl),
    createdAt: existing.exists ? existing.data()?.createdAt : FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt:
      parsed.status === "published"
        ? FieldValue.serverTimestamp()
        : existing.data()?.publishedAt ?? null,
  };

  await ref.set(data, { merge: true });

  return ref.id;
}

export async function deleteEvent(id: string) {
  await getAdminDb().collection(eventsCollection).doc(id).delete();
}

export async function listNewsletters() {
  if (!isFirebaseConfigured()) {
    return [];
  }

  const snapshot = await getAdminDb().collection(newslettersCollection).get();
  return snapshot.docs.map(newsletterFromDoc).sort(byNewsletterDate);
}

export async function listPublishedNewsletters() {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const snapshot = await getAdminDb()
      .collection(newslettersCollection)
      .where("status", "==", "published")
      .get();

    return snapshot.docs.map(newsletterFromDoc).sort(byNewsletterDate);
  } catch {
    return [];
  }
}

export async function getNewsletter(id: string) {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const doc = await getAdminDb().collection(newslettersCollection).doc(id).get();

  return doc.exists
    ? newsletterFromDoc(doc as QueryDocumentSnapshot)
    : null;
}

export async function getPublishedNewsletterBySlug(slug: string) {
  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const snapshot = await getAdminDb()
      .collection(newslettersCollection)
      .where("status", "==", "published")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    return snapshot.empty ? null : newsletterFromDoc(snapshot.docs[0]!);
  } catch {
    return null;
  }
}

export async function saveNewsletter(input: NewsletterInput) {
  const parsed = newsletterInputSchema.parse(input);
  const slug = slugify(parsed.slug || parsed.title);

  if (!slug) {
    throw new Error("Newsletter slug is required.");
  }

  const db = getAdminDb();
  const ref = parsed.id
    ? db.collection(newslettersCollection).doc(parsed.id)
    : db.collection(newslettersCollection).doc(slug);
  const existing = await ref.get();
  const data = {
    title: parsed.title,
    slug,
    excerpt: parsed.excerpt,
    body: parsed.body,
    publishDate: parsed.publishDate,
    status: parsed.status,
    createdAt: existing.exists ? existing.data()?.createdAt : FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt:
      parsed.status === "published"
        ? FieldValue.serverTimestamp()
        : existing.data()?.publishedAt ?? null,
  };

  await ref.set(data, { merge: true });

  return ref.id;
}

export async function deleteNewsletter(id: string) {
  await getAdminDb().collection(newslettersCollection).doc(id).delete();
}
