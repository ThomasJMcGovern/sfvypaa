"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  type Auth,
} from "firebase/auth";

// These values are public by design (client config). The allowlist + session
// verification on the server is what actually gates access.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-sfvypaa",
};

export function getClientAuth(): Auth {
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);

  const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;

  if (emulatorHost && !auth.emulatorConfig) {
    connectAuthEmulator(auth, `http://${emulatorHost}`, {
      disableWarnings: true,
    });
  }

  return auth;
}

export const googleProvider = new GoogleAuthProvider();
