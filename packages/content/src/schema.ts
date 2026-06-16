import { z } from "zod";

export const contentStatusSchema = z.enum(["draft", "published"]);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const eventHostSchema = z.enum([
  "Hosted by VALLEYPAA",
  "Co-hosted by VALLEYPAA",
]);
export type EventHost = z.infer<typeof eventHostSchema>;

const optionalUrlSchema = z.string().trim().pipe(
  z.union([
    z.literal(""),
    z.string().url("Enter a full URL including https://"),
  ]),
);

export const eventInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  eventDate: z.string().trim().min(1, "Date is required"),
  date: z.string().trim().min(1, "Date is required"),
  time: z.string().trim().min(1, "Time is required"),
  location: z.string().trim().min(1, "Location is required"),
  tone: z.string().trim().min(1, "Summary is required"),
  host: eventHostSchema,
  status: contentStatusSchema,
  sortDate: z.string().trim().optional(),
  rsvpUrl: optionalUrlSchema,
  imageUrl: optionalUrlSchema,
});
export type EventInput = z.infer<typeof eventInputSchema>;

export type EventRecord = Omit<EventInput, "id"> & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export const newsletterInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().min(1, "Excerpt is required"),
  body: z.string().trim().min(1, "Body is required"),
  publishDate: z.string().trim().min(1, "Publish date is required"),
  status: contentStatusSchema,
});
export type NewsletterInput = z.infer<typeof newsletterInputSchema>;

export type NewsletterRecord = Omit<NewsletterInput, "id" | "slug"> & {
  id: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export const socialPostInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  caption: z.string().trim().min(1, "Caption is required"),
  instagramUrl: z
    .string()
    .trim()
    .url("Enter a full Instagram URL including https://"),
  imageUrl: optionalUrlSchema,
  postDate: z.string().trim().min(1, "Post date is required"),
  status: contentStatusSchema,
});
export type SocialPostInput = z.infer<typeof socialPostInputSchema>;

export type SocialPostRecord = Omit<SocialPostInput, "id"> & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export const siteSettingsInputSchema = z.object({
  showInstagramSocials: z.boolean(),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;

export type SiteSettingsRecord = SiteSettingsInput & {
  id: string;
  updatedAt?: string;
};

export const emptyEvent: EventInput = {
  title: "",
  eventDate: "",
  date: "",
  time: "",
  location: "",
  tone: "",
  host: "Hosted by VALLEYPAA",
  status: "draft",
  sortDate: "",
  rsvpUrl: "",
  imageUrl: "",
};

export const emptyNewsletter: NewsletterInput = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  publishDate: "",
  status: "draft",
};

export const emptySocialPost: SocialPostInput = {
  title: "",
  caption: "",
  instagramUrl: "https://www.instagram.com/",
  imageUrl: "",
  postDate: "",
  status: "draft",
};

export const defaultSiteSettings: SiteSettingsInput = {
  showInstagramSocials: true,
};
