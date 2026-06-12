import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import {
  initializeFirestore,
  type Firestore,
} from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let adminDb: Firestore | undefined;

const emulatorProjectId = "demo-sfvypaa";

export function isUsingEmulator() {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST);
}

function hasServiceAccount() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

export function isFirebaseConfigured() {
  return isUsingEmulator() || hasServiceAccount();
}

export function getFirebaseProjectId() {
  // Emulator mode is authoritative: always the offline demo project, even if
  // real service-account creds happen to be present in the environment. This
  // keeps the Admin SDK's project ID matched to emulator-issued token audiences.
  if (isUsingEmulator()) {
    return emulatorProjectId;
  }

  return process.env.FIREBASE_PROJECT_ID || "";
}

export function getStorageBucketName() {
  if (isUsingEmulator()) {
    return `${emulatorProjectId}.appspot.com`;
  }

  return (
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    ""
  );
}

export function isFirebaseStorageConfigured() {
  if (isUsingEmulator()) {
    return Boolean(process.env.FIREBASE_STORAGE_EMULATOR_HOST);
  }

  return Boolean(isFirebaseConfigured() && getStorageBucketName());
}

export function getAdminApp(): App {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Admin env vars are not configured.");
  }

  const existing = getApps()[0];

  if (existing) {
    return existing;
  }

  // Against the emulators no credentials are used — even if real ones are
  // present in the environment, emulator mode stays fully offline on the demo
  // project so token audiences and data endpoints stay consistent.
  if (isUsingEmulator()) {
    return initializeApp({
      projectId: emulatorProjectId,
      storageBucket: getStorageBucketName() || undefined,
    });
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: getStorageBucketName() || undefined,
  });
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

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
