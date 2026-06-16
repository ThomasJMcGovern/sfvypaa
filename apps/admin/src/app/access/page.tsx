import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { GoogleSignIn } from "@/components/google-signin";
import {
  getCurrentAdmin,
  getSafeReturnPath,
} from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in | VALLEYPAA Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = getSafeReturnPath(params.next);

  // Already signed in → straight to the console.
  if (await getCurrentAdmin()) {
    redirect(nextPath);
  }

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
          <h1 className="mt-3 text-5xl text-bone uppercase">VALLEYPAA Admin</h1>
          <p className="mt-2.5 font-mono text-[13px] text-[#8A8472]">
            Committee publishing console
          </p>
        </div>

        <div className="flex flex-col gap-4.5 border-[5px] border-orange bg-paper p-7 text-ink shadow-stamp-lg">
          <span className="self-start border-2 border-ink bg-orange px-2.5 py-0.5 text-xs font-bold tracking-[0.14em] text-ink uppercase">
            Members only
          </span>
          <div>
            <p className="label-stamp text-orange">★ Sign in</p>
            <p className="mt-2 text-sm leading-6 text-ink-2">
              Use your committee Google account. Access is per-person and
              every change is logged.
            </p>
          </div>
          <GoogleSignIn next={nextPath} />
          <p className="text-center text-[13px] leading-normal text-ink-2">
            Access is committee-approved. Trouble getting in? Ask an owner at
            the business meeting.
          </p>
        </div>

        <p className="mt-4.5 text-center font-mono text-xs text-[#6E685B]">
          The newcomer is still the most important person in the room →
        </p>
      </div>
    </main>
  );
}
