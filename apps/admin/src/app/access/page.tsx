import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminAccessPath,
  adminCookieName,
  createAdminToken,
  getAdminPassword,
  getSafeReturnPath,
} from "@/lib/admin-gate";

async function unlockAdmin(formData: FormData) {
  "use server";

  const submittedPassword = formData.get("password");
  const nextPath = getSafeReturnPath(formData.get("next"));
  const configuredPassword = getAdminPassword();

  if (
    !configuredPassword ||
    typeof submittedPassword !== "string" ||
    submittedPassword !== configuredPassword
  ) {
    const params = new URLSearchParams({ error: "1", next: nextPath });
    redirect(`${adminAccessPath}?${params.toString()}`);
  }

  const token = await createAdminToken(configuredPassword);
  const cookieStore = await cookies();

  cookieStore.set(adminCookieName, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(nextPath);
}

export default async function AdminAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const nextPath = getSafeReturnPath(params.next);

  return (
    <main className="relative min-h-screen overflow-hidden bg-primary text-primary-foreground">
      <Image
        src="/stage-lights.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(20,18,14,0.92),rgba(20,18,14,0.62),rgba(20,18,14,0.9))]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 sm:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-normal text-white/80">
              <LockKeyhole className="size-3.5" aria-hidden="true" />
              SFVYPAA Admin
            </div>
            <h1 className="text-5xl font-black leading-[0.92] tracking-normal text-white sm:text-7xl lg:text-8xl">
              Publish hub
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/76 sm:text-lg">
              Manage public events and newsletter archive posts.
            </p>
          </div>

          <Card className="rounded-lg border-white/16 bg-white/92 text-foreground shadow-2xl shadow-black/25 backdrop-blur">
            <CardHeader className="gap-2 p-6 pb-2">
              <CardTitle className="text-3xl font-black tracking-normal">
                Admin access
              </CardTitle>
              <CardDescription>
                Enter the admin password to publish SFVYPAA content.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-3">
              <form action={unlockAdmin} className="space-y-4">
                <input type="hidden" name="next" value={nextPath} />
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-foreground"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    aria-invalid={hasError}
                    className="h-12 rounded-md bg-white px-4 text-base"
                  />
                  {hasError ? (
                    <p className="text-sm font-medium text-destructive">
                      That password did not work.
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-md text-base font-bold"
                >
                  Enter admin
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
