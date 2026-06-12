import Image from "next/image";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminAccessPath,
  adminCookieName,
  createAdminToken,
  getAdminPassword,
  getSafeReturnPath,
  shouldUseSecureAdminCookie,
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
  const requestHeaders = await headers();
  const cookieStore = await cookies();

  cookieStore.set(adminCookieName, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
    sameSite: "lax",
    secure: shouldUseSecureAdminCookie(
      requestHeaders.get("host"),
      requestHeaders.get("x-forwarded-proto"),
    ),
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
    <main className="grain flex min-h-screen items-center justify-center bg-ink p-5 text-bone">
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <Image
            alt="Punk Bill"
            className="mx-auto h-[84px] w-[84px] object-contain invert"
            height={84}
            priority
            src="/assets/punk-bill-ink.png"
            width={84}
          />
          <h1 className="mt-3 text-5xl text-bone uppercase">SFVYPAA Admin</h1>
          <p className="mt-2.5 font-mono text-[13px] text-[#8A8472]">
            Committee publishing console
          </p>
        </div>

        <form
          action={unlockAdmin}
          className="flex flex-col gap-4.5 border-[5px] border-orange bg-paper p-7 text-ink shadow-stamp-lg"
        >
          <input type="hidden" name="next" value={nextPath} />
          <span className="self-start border-2 border-ink bg-orange px-2.5 py-0.5 text-xs font-bold tracking-[0.14em] text-ink uppercase">
            Members only
          </span>
          <div className="grid gap-2">
            <label className="label-stamp text-ink" htmlFor="password">
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
              className="h-12 border-ink bg-white font-mono text-ink"
            />
            {hasError ? (
              <p className="text-sm font-bold text-stop">
                That password did not work. Try again.
              </p>
            ) : null}
          </div>
          <Button className="w-full" size="lg" type="submit">
            Sign in
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
          <p className="text-center text-[13px] leading-normal text-ink-2">
            Access is committee-approved. Trouble getting in? Ask at the
            business meeting.
          </p>
        </form>

        <p className="mt-4.5 text-center font-mono text-xs text-[#6E685B]">
          The newcomer is still the most important person in the room →
        </p>
      </div>
    </main>
  );
}
