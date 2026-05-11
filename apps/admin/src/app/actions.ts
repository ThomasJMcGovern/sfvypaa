"use server";

import {
  deleteEvent,
  deleteNewsletter,
  eventInputSchema,
  getNewsletter,
  getNewsletterBySlug,
  newsletterInputSchema,
  saveEvent,
  saveNewsletter,
  slugify,
  uploadEventImage,
  type EventHost,
  type EventInput,
  type ContentStatus,
  type NewsletterInput,
} from "@sfvypaa/content";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  adminAccessPath,
  adminCookieName,
  isAdminCookieValid,
} from "@/lib/admin-gate";

export type AdminActionState = {
  message?: string;
  fieldErrors?: Record<string, string>;
} | null;

const publicSiteFallbackUrl = "https://sfvypaa.org";
const publicRevalidateHeader = "x-sfvypaa-revalidate-secret";

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function status(formData: FormData): ContentStatus {
  return field(formData, "intent") === "publish" ? "published" : "draft";
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

function validationState(error: {
  issues: Array<{ path: Array<PropertyKey>; message: string }>;
}): AdminActionState {
  const fieldErrors: Record<string, string> = {};
  const firstIssue = error.issues[0];

  if (!firstIssue) {
    return { message: "Check the form fields and try again." };
  }

  for (const issue of error.issues) {
    const fieldName = issue.path.map(String).join(".");

    if (fieldName && !fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }
  }

  const fieldName = firstIssue.path.map(String).join(".");

  return {
    message: fieldName
      ? "Fix the highlighted fields and try again."
      : firstIssue.message,
    fieldErrors,
  };
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

function errorState(error: unknown, fieldName?: string): AdminActionState {
  const message = saveErrorMessage(error);

  return {
    message,
    fieldErrors: fieldName ? { [fieldName]: message } : undefined,
  };
}

function slugError(message: string): AdminActionState {
  return {
    message,
    fieldErrors: {
      slug: message,
    },
  };
}

function isImageUploadError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.startsWith("Upload a ") ||
      error.message.startsWith("Image must be "))
  );
}

async function hasAdminAccess() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(adminCookieName)?.value;

  return isAdminCookieValid(accessCookie);
}

async function adminSessionError() {
  const hasAccess = await hasAdminAccess();

  return hasAccess
    ? null
    : {
        message: "Your admin session expired. Reload and sign in again.",
      };
}

async function requireAdminOrRedirect(nextPath: string) {
  if (await hasAdminAccess()) {
    return;
  }

  const params = new URLSearchParams({ next: nextPath });
  redirect(`${adminAccessPath}?${params.toString()}`);
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

function publicSiteUrl() {
  const value = process.env.SFVYPAA_PUBLIC_SITE_URL?.trim();

  return value || publicSiteFallbackUrl;
}

function publicNewsletterPaths(...slugs: Array<string | undefined>) {
  const paths = ["/newsletters"];

  for (const slug of slugs) {
    if (slug) {
      paths.push(`/newsletters/${slug}`);
    }
  }

  return [...new Set(paths)];
}

async function revalidatePublicSite(paths: string[]) {
  const secret = process.env.SFVYPAA_REVALIDATE_SECRET;

  if (!secret) {
    return;
  }

  try {
    const response = await fetch(new URL("/api/revalidate", publicSiteUrl()), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        [publicRevalidateHeader]: secret,
      },
      body: JSON.stringify({ paths }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(
        `Public site revalidation failed with status ${response.status}.`,
      );
    }
  } catch (error) {
    console.error("Public site revalidation failed.", error);
  }
}

export async function saveEventAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const sessionError = await adminSessionError();

  if (sessionError) {
    return sessionError;
  }

  const parsed = eventInputSchema.safeParse(eventInput(formData));

  if (!parsed.success) {
    return validationState(parsed.error);
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
    return isImageUploadError(error)
      ? errorState(error, "imageFile")
      : errorState(error);
  }

  revalidatePath("/events");
  revalidatePath("/upcoming-events");
  redirect(`/events/${id}`);
}

export async function deleteEventAction(formData: FormData) {
  await requireAdminOrRedirect("/events");

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
  const sessionError = await adminSessionError();

  if (sessionError) {
    return sessionError;
  }

  const parsed = newsletterInputSchema.safeParse(newsletterInput(formData));

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  let id: string;
  let publicPaths: string[];

  try {
    const existingNewsletter = parsed.data.id
      ? await getNewsletter(parsed.data.id)
      : null;
    const slug = slugify(parsed.data.slug || parsed.data.title);

    if (!slug) {
      return slugError("Use at least one letter or number in the URL slug.");
    }

    const slugOwner = await getNewsletterBySlug(slug);

    if (slugOwner && slugOwner.id !== parsed.data.id) {
      return slugError("That URL slug is already used by another newsletter.");
    }

    id = await saveNewsletter(parsed.data);
    publicPaths = publicNewsletterPaths(slug, existingNewsletter?.slug);
  } catch (error) {
    return errorState(error);
  }

  revalidatePath("/newsletters");
  await revalidatePublicSite(publicPaths);
  redirect(`/newsletters/${id}`);
}

export async function deleteNewsletterAction(formData: FormData) {
  await requireAdminOrRedirect("/newsletters");

  const id = field(formData, "id");
  let publicPaths = publicNewsletterPaths();

  if (id) {
    const existingNewsletter = await getNewsletter(id);

    await deleteNewsletter(id);
    publicPaths = publicNewsletterPaths(existingNewsletter?.slug);
  }

  revalidatePath("/newsletters");
  await revalidatePublicSite(publicPaths);
  redirect("/newsletters");
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();

  cookieStore.set(adminCookieName, "", {
    maxAge: 0,
    path: "/",
  });

  redirect(adminAccessPath);
}
