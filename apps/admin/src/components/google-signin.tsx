"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { ArrowRight, LogIn } from "lucide-react";

import { getClientAuth, googleProvider } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";

type SignInState = "idle" | "busy" | "not-allowed" | "failed";

export function GoogleSignIn({ next }: { next: string }) {
  const [state, setState] = useState<SignInState>("idle");

  async function signIn() {
    setState("busy");
    const auth = getClientAuth();

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken = await credential.user.getIdToken();

      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken, next }),
      });

      if (response.ok) {
        const data = (await response.json()) as { redirect?: string };
        window.location.assign(data.redirect || "/");
        return;
      }

      // Rejected by the allowlist — drop the client session too.
      await auth.signOut();
      setState(response.status === 403 ? "not-allowed" : "failed");
    } catch {
      await auth.signOut().catch(() => {});
      setState("failed");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        className="w-full"
        disabled={state === "busy"}
        onClick={signIn}
        size="lg"
        type="button"
      >
        <LogIn data-icon="inline-start" />
        {state === "busy" ? "Signing in…" : "Sign in with Google"}
        {state !== "busy" ? <ArrowRight data-icon="inline-end" /> : null}
      </Button>

      {state === "not-allowed" ? (
        <p className="text-sm font-bold text-stop">
          That Google account isn&apos;t on the committee allowlist. Ask an
          owner to add you.
        </p>
      ) : null}
      {state === "failed" ? (
        <p className="text-sm font-bold text-stop">
          Sign-in didn&apos;t complete. Try again.
        </p>
      ) : null}
    </div>
  );
}
