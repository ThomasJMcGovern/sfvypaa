import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import {
  initializeFirestore,
  type Firestore,
} from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let adminDb: Firestore | undefined;

export function isFirebaseConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

export function getStorageBucketName() {
  return (
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    ""
  );
}

export function isFirebaseStorageConfigured() {
  return Boolean(isFirebaseConfigured() && getStorageBucketName());
}

export function getAdminApp(): App {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Admin env vars are not configured.");
  }

  return (
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: getStorageBucketName() || undefined,
    })
  );
}

export function getAdminDb() {
  adminDb ??= initializeFirestore(getAdminApp(), { preferRest: true });

  return adminDb;
}

export function getAdminBucket() {
  if (!isFirebaseStorageConfigured()) {
    throw new Error("Firebase Storage bucket is not configured.");
  }

  return getStorage(getAdminApp()).bucket(getStorageBucketName());
}
