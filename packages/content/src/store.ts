import {
  FieldValue,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";

import { getAdminDb, isFirebaseConfigured } from "./firebase";
import {
  defaultSiteSettings,
  eventInputSchema,
  type EventInput,
  type EventRecord,
  newsletterInputSchema,
  type NewsletterInput,
  type NewsletterRecord,
  siteSettingsInputSchema,
  type SiteSettingsInput,
  type SiteSettingsRecord,
  socialPostInputSchema,
  type SocialPostInput,
  type SocialPostRecord,
} from "./schema";

const eventsCollection = "events";
const newslettersCollection = "newsletters";
const socialPostsCollection = "socialPosts";
const settingsCollection = "settings";
const siteSettingsDocument = "site";

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
    eventDate: typeof data.eventDate === "string" ? data.eventDate : "",
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

function socialPostFromDoc(doc: QueryDocumentSnapshot): SocialPostRecord {
  const data = doc.data();

  return {
    id: doc.id,
    title: String(data.title ?? ""),
    caption: String(data.caption ?? ""),
    instagramUrl: String(data.instagramUrl ?? ""),
    imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : "",
    postDate: String(data.postDate ?? ""),
    status: data.status === "published" ? "published" : "draft",
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    publishedAt: toIsoString(data.publishedAt),
  };
}

function siteSettingsFromData(
  id: string,
  data: DocumentData | undefined,
): SiteSettingsRecord {
  return {
    id,
    ...defaultSiteSettings,
    showInstagramSocials:
      typeof data?.showInstagramSocials === "boolean"
        ? data.showInstagramSocials
        : defaultSiteSettings.showInstagramSocials,
    updatedAt: toIsoString(data?.updatedAt),
  };
}

function byEventDate(a: EventRecord, b: EventRecord) {
  return (a.eventDate || a.sortDate || a.date).localeCompare(
    b.eventDate || b.sortDate || b.date,
  );
}

function byNewsletterDate(a: NewsletterRecord, b: NewsletterRecord) {
  return b.publishDate.localeCompare(a.publishDate);
}

function bySocialPostDate(a: SocialPostRecord, b: SocialPostRecord) {
  return b.postDate.localeCompare(a.postDate);
}

export async function listEvents() {
  if (!isFirebaseConfigured()) {
    return [];
  }

  const snapshot = await getAdminDb().collection(eventsCollection).get();
  return snapshot.docs.map(eventFromDoc).sort(byEventDate);
}

export async function listEventLocations() {
  const events = await listEvents();
  const locations = new Set<string>();

  for (const event of events) {
    const location = event.location.trim();

    if (location) {
      locations.add(location);
    }
  }

  return [...locations].sort((a, b) => a.localeCompare(b));
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
  const existingData = existing.data();
  const data = {
    title: parsed.title,
    eventDate: parsed.eventDate ?? "",
    date: parsed.date,
    time: parsed.time,
    location: parsed.location,
    tone: parsed.tone,
    host: parsed.host,
    status: parsed.status,
    sortDate: parsed.sortDate ?? "",
    rsvpUrl: cleanOptionalUrl(parsed.rsvpUrl),
    imageUrl: cleanOptionalUrl(parsed.imageUrl),
    createdAt: existing.exists
      ? existingData?.createdAt
      : FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt:
      parsed.status === "published"
        ? existingData?.publishedAt ?? FieldValue.serverTimestamp()
        : existingData?.publishedAt ?? null,
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

export async function getNewsletterBySlug(slug: string) {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const snapshot = await getAdminDb()
    .collection(newslettersCollection)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  return snapshot.empty ? null : newsletterFromDoc(snapshot.docs[0]!);
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
  const existingData = existing.data();
  const data = {
    title: parsed.title,
    slug,
    excerpt: parsed.excerpt,
    body: parsed.body,
    publishDate: parsed.publishDate,
    status: parsed.status,
    createdAt: existing.exists
      ? existingData?.createdAt
      : FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt:
      parsed.status === "published"
        ? existingData?.publishedAt ?? FieldValue.serverTimestamp()
        : existingData?.publishedAt ?? null,
  };

  await ref.set(data, { merge: true });

  return ref.id;
}

export async function deleteNewsletter(id: string) {
  await getAdminDb().collection(newslettersCollection).doc(id).delete();
}

export async function listSocialPosts() {
  if (!isFirebaseConfigured()) {
    return [];
  }

  const snapshot = await getAdminDb().collection(socialPostsCollection).get();
  return snapshot.docs.map(socialPostFromDoc).sort(bySocialPostDate);
}

export async function listPublishedSocialPosts() {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const snapshot = await getAdminDb()
      .collection(socialPostsCollection)
      .where("status", "==", "published")
      .get();

    return snapshot.docs.map(socialPostFromDoc).sort(bySocialPostDate);
  } catch {
    return [];
  }
}

export async function getSocialPost(id: string) {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const doc = await getAdminDb().collection(socialPostsCollection).doc(id).get();

  return doc.exists
    ? socialPostFromDoc(doc as QueryDocumentSnapshot)
    : null;
}

export async function saveSocialPost(input: SocialPostInput) {
  const parsed = socialPostInputSchema.parse(input);
  const db = getAdminDb();
  const ref = parsed.id
    ? db.collection(socialPostsCollection).doc(parsed.id)
    : db.collection(socialPostsCollection).doc();
  const existing = await ref.get();
  const existingData = existing.data();
  const data = {
    title: parsed.title,
    caption: parsed.caption,
    instagramUrl: parsed.instagramUrl,
    imageUrl: cleanOptionalUrl(parsed.imageUrl),
    postDate: parsed.postDate,
    status: parsed.status,
    createdAt: existing.exists
      ? existingData?.createdAt
      : FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt:
      parsed.status === "published"
        ? existingData?.publishedAt ?? FieldValue.serverTimestamp()
        : existingData?.publishedAt ?? null,
  };

  await ref.set(data, { merge: true });

  return ref.id;
}

export async function deleteSocialPost(id: string) {
  await getAdminDb().collection(socialPostsCollection).doc(id).delete();
}

export async function getSiteSettings() {
  if (!isFirebaseConfigured()) {
    return siteSettingsFromData(siteSettingsDocument, undefined);
  }

  try {
    const doc = await getAdminDb()
      .collection(settingsCollection)
      .doc(siteSettingsDocument)
      .get();

    return siteSettingsFromData(siteSettingsDocument, doc.data());
  } catch {
    return siteSettingsFromData(siteSettingsDocument, undefined);
  }
}

export async function saveSiteSettings(input: SiteSettingsInput) {
  const parsed = siteSettingsInputSchema.parse(input);
  const ref = getAdminDb()
    .collection(settingsCollection)
    .doc(siteSettingsDocument);

  await ref.set(
    {
      showInstagramSocials: parsed.showInstagramSocials,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return siteSettingsDocument;
}
