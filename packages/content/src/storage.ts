import { randomUUID } from "node:crypto";

import { getDownloadURL } from "firebase-admin/storage";

import { getAdminBucket, getStorageBucketName } from "./firebase";
import { slugify } from "./store";

export type UploadableImage = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

const maxImageSize = 6 * 1024 * 1024;

const imageExtensions: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function uploadImage(
  image: UploadableImage,
  title: string,
  folder: string,
  fallbackName: string,
) {
  const extension = imageExtensions[image.type];

  if (!extension) {
    throw new Error("Upload a PNG, JPG, GIF, or WebP image.");
  }

  if (image.size > maxImageSize) {
    throw new Error("Image must be 6 MB or smaller.");
  }

  const bytes = Buffer.from(await image.arrayBuffer());
  const token = randomUUID();
  const filename = `${slugify(title) || fallbackName}-${randomUUID()}.${extension}`;
  const bucket = getAdminBucket();
  const [bucketExists] = await bucket.exists();

  if (!bucketExists) {
    throw new Error(
      `Firebase Storage bucket "${getStorageBucketName()}" does not exist. Create or enable Firebase Storage for this Firebase project, then set FIREBASE_STORAGE_BUCKET to the bucket name.`,
    );
  }

  const file = bucket.file(`${folder}/${filename}`);

  await file.save(bytes, {
    metadata: {
      cacheControl: "public, max-age=31536000",
      contentType: image.type,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  return getDownloadURL(file);
}

export async function uploadEventImage(
  image: UploadableImage,
  eventTitle: string,
) {
  return uploadImage(image, eventTitle, "events", "event");
}

export async function uploadSocialPostImage(
  image: UploadableImage,
  postTitle: string,
) {
  return uploadImage(image, postTitle, "social-posts", "social-post");
}
