"use client";

import { useActionState } from "react";
import type { SiteSettingsInput } from "@sfvypaa/content";
import { Eye, EyeOff, Save } from "lucide-react";

import {
  saveSiteSettingsAction,
  type AdminActionState,
} from "@/app/actions";
import { Button } from "@/components/ui/button";

const initialState: AdminActionState = null;

export function SiteSettingsForm({
  settings,
}: {
  settings: SiteSettingsInput;
}) {
  const [state, formAction, isPending] = useActionState(
    saveSiteSettingsAction,
    initialState,
  );
  const hasErrors = Boolean(state?.fieldErrors);

  return (
    <form action={formAction} className="grid gap-5">
      {state?.message ? (
        <p
          aria-live="polite"
          className={
            hasErrors
              ? "rounded-[8px] border border-red-400/40 bg-red-950/50 px-4 py-3 text-sm font-medium text-red-100"
              : "rounded-[8px] border border-emerald-300/30 bg-emerald-950/40 px-4 py-3 text-sm font-medium text-emerald-100"
          }
        >
          {state.message}
        </p>
      ) : null}
      <label className="grid gap-4 rounded-[8px] border border-white/10 bg-white/[0.06] p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <span className="flex size-11 items-center justify-center rounded-[8px] bg-[#ffcf6b] text-[#191109]">
          {settings.showInstagramSocials ? (
            <Eye className="size-5" />
          ) : (
            <EyeOff className="size-5" />
          )}
        </span>
        <span>
          <span className="block text-lg font-black text-white">
            Show Instagram socials on homepage
          </span>
          <span className="mt-1 block text-sm leading-6 text-white/62">
            Controls whether the curated Instagram Socials section appears on
            the public homepage.
          </span>
        </span>
        <input
          className="size-6 rounded-[6px] accent-[#ffcf6b]"
          defaultChecked={settings.showInstagramSocials}
          name="showInstagramSocials"
          type="checkbox"
        />
      </label>
      <Button
        className="h-11 w-fit rounded-[8px] bg-[#ffcf6b] px-4 text-[#191109] hover:bg-[#f3b83f]"
        disabled={isPending}
        type="submit"
      >
        <Save className="size-4" />
        {isPending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
