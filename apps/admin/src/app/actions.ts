"use server";

import {
  deleteEvent,
  deleteNewsletter,
  deleteSocialPost,
  eventInputSchema,
  getEvent,
  getNewsletter,
  getNewsletterBySlug,
  getSocialPost,
  newsletterInputSchema,
  saveEvent,
  saveNewsletter,
  saveSiteSettings,
  saveSocialPost,
  siteSettingsInputSchema,
  slugify,
  socialPostInputSchema,
  uploadEventImage,
  uploadSocialPostImage,
  type Actor,
  type EventHost,
  type EventInput,
  type ContentStatus,
  type NewsletterInput,
  type SiteSettingsInput,
  type SocialPostInput,
} from "@valleypaa/content";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  adminAccessPath,
  adminToActor,
  clearAdminSession,
  getCurrentAdmin,
} from "@/lib/admin-session";
import { formatEventDateLabel } from "@/lib/event-date";

export type AdminActionState = {
  message?: string;
  fieldErrors?: Record<string, string>;
} | null;

const publicSiteFallbackUrl = "https://valleypaa.org";
const publicRevalidateHeader = "x-valleypaa-revalidate-secret";

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function status(formData: FormData): ContentStatus {
  return field(formData, "intent") === "publish" ? "published" : "draft";
}

function host(formData: FormData): EventHost {
  return field(formData, "host").startsWith("Co-hosted")
    ? "Co-hosted by VALLEYPAA"
    : "Hosted by VALLEYPAA";
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

// Only messages we author and know are safe to surface go to the client.
// Image-validation messages are intentionally user-facing; everything else
// (config/internal errors that could name env vars or internals) is logged
// server-side and replaced with a generic message.
function isSafeClientMessage(message: string) {
  return message.startsWith("Upload a ") || message.startsWith("Image must be ");
}

function saveErrorMessage(error: unknown) {
  if (error instanceof Error && isSafeClientMessage(error.message)) {
    return error.message;
  }

  console.error("[admin] save failed", {
    message: error instanceof Error ? error.message : String(error),
  });

  return "Publishing is temporarily unavailable. Try again, or contact an owner.";
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

const sessionExpiredState: AdminActionState = {
  message: "Your admin session expired. Reload and sign in again.",
};

// For save actions (return an error state). Returns the acting admin's Actor,
// or null when the session is gone.
async function actionActor(): Promise<Actor | null> {
  const admin = await getCurrentAdmin();
  return admin ? adminToActor(admin) : null;
}

// For redirect-style actions (delete/toggle). Returns the Actor or bounces to
// the sign-in door.
async function requireActionActor(): Promise<Actor> {
  const actor = await actionActor();

  if (!actor) {
    redirect(adminAccessPath);
  }

  return actor;
}

function eventInput(formData: FormData): EventInput {
  const eventDate = field(formData, "eventDate");
  const dateLabel = field(formData, "dateLabel").trim();

  return {
    id: field(formData, "id") || undefined,
    title: field(formData, "title"),
    eventDate,
    // A custom label (e.g. "Second Saturday of each month") wins and survives
    // re-saves; otherwise fall back to the calendar date.
    date: dateLabel || formatEventDateLabel(eventDate),
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

function socialPostInput(formData: FormData): SocialPostInput {
  return {
    id: field(formData, "id") || undefined,
    title: field(formData, "title"),
    caption: field(formData, "caption"),
    instagramUrl: field(formData, "instagramUrl"),
    imageUrl: field(formData, "existingImageUrl"),
    postDate: field(formData, "postDate"),
    status: status(formData),
  };
}

function siteSettingsInput(formData: FormData): SiteSettingsInput {
  return {
    showInstagramSocials: field(formData, "showInstagramSocials") === "on",
    showDailyReflection: field(formData, "showDailyReflection") === "on",
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
    console.error("Public site revalidation failed.", {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function saveEventAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const actor = await actionActor();

  if (!actor) {
    return sessionExpiredState;
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

    id = await saveEvent(data, actor);
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
  const actor = await requireActionActor();

  const id = field(formData, "id");

  if (id) {
    await deleteEvent(id, actor);
  }

  revalidatePath("/events");
  revalidatePath("/upcoming-events");
  redirect("/events");
}

export async function saveNewsletterAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const actor = await actionActor();

  if (!actor) {
    return sessionExpiredState;
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

    id = await saveNewsletter(parsed.data, actor);
    publicPaths = publicNewsletterPaths(slug, existingNewsletter?.slug);
  } catch (error) {
    return errorState(error);
  }

  revalidatePath("/newsletters");
  await revalidatePublicSite(publicPaths);
  redirect(`/newsletters/${id}`);
}

export async function deleteNewsletterAction(formData: FormData) {
  const actor = await requireActionActor();

  const id = field(formData, "id");
  let publicPaths = publicNewsletterPaths();

  if (id) {
    const existingNewsletter = await getNewsletter(id);

    await deleteNewsletter(id, actor);
    publicPaths = publicNewsletterPaths(existingNewsletter?.slug);
  }

  revalidatePath("/newsletters");
  await revalidatePublicSite(publicPaths);
  redirect("/newsletters");
}

export async function saveSocialPostAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const actor = await actionActor();

  if (!actor) {
    return sessionExpiredState;
  }

  const parsed = socialPostInputSchema.safeParse(socialPostInput(formData));

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  let id: string;

  try {
    const image = uploadedImage(formData);
    const data = image
      ? {
          ...parsed.data,
          imageUrl: await uploadSocialPostImage(image, parsed.data.title),
        }
      : parsed.data;

    if (data.status === "published" && !data.imageUrl) {
      return {
        message: "Add an image before publishing this social post.",
        fieldErrors: {
          imageFile: "Add an image before publishing this social post.",
        },
      };
    }

    id = await saveSocialPost(data, actor);
  } catch (error) {
    return isImageUploadError(error)
      ? errorState(error, "imageFile")
      : errorState(error);
  }

  revalidatePath("/");
  revalidatePath("/social-posts");
  await revalidatePublicSite(["/"]);
  redirect(`/social-posts/${id}`);
}

export async function deleteSocialPostAction(formData: FormData) {
  const actor = await requireActionActor();

  const id = field(formData, "id");

  if (id) {
    await deleteSocialPost(id, actor);
  }

  revalidatePath("/");
  revalidatePath("/social-posts");
  await revalidatePublicSite(["/"]);
  redirect("/social-posts");
}

export async function saveSiteSettingsAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const actor = await actionActor();

  if (!actor) {
    return sessionExpiredState;
  }

  const parsed = siteSettingsInputSchema.safeParse(siteSettingsInput(formData));

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  try {
    await saveSiteSettings(parsed.data, actor);
  } catch (error) {
    return errorState(error);
  }

  revalidatePath("/");
  revalidatePath("/settings");
  await revalidatePublicSite(["/"]);

  return {
    message: "Settings saved.",
  };
}

function nextStatus(formData: FormData): ContentStatus {
  return field(formData, "nextStatus") === "published" ? "published" : "draft";
}

export async function toggleEventStatusAction(formData: FormData) {
  const actor = await requireActionActor();

  const id = field(formData, "id");
  const event = id ? await getEvent(id) : null;

  if (event) {
    await saveEvent({ ...event, status: nextStatus(formData) }, actor);
    revalidatePath("/events");
    revalidatePath("/upcoming-events");
  }

  redirect("/events");
}

export async function toggleNewsletterStatusAction(formData: FormData) {
  const actor = await requireActionActor();

  const id = field(formData, "id");
  const newsletter = id ? await getNewsletter(id) : null;

  if (newsletter) {
    await saveNewsletter({ ...newsletter, status: nextStatus(formData) }, actor);
    revalidatePath("/newsletters");
    await revalidatePublicSite(publicNewsletterPaths(newsletter.slug));
  }

  redirect("/newsletters");
}

export async function toggleSocialPostStatusAction(formData: FormData) {
  const actor = await requireActionActor();

  const id = field(formData, "id");
  const post = id ? await getSocialPost(id) : null;
  const target = nextStatus(formData);

  // publishing a social post without an image is blocked in the editor too
  if (post && !(target === "published" && !post.imageUrl)) {
    await saveSocialPost({ ...post, status: target }, actor);
    revalidatePath("/");
    revalidatePath("/social-posts");
    await revalidatePublicSite(["/"]);
  }

  redirect("/social-posts");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect(adminAccessPath);
}
