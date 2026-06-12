"use client";

import { useActionState } from "react";
import type { SiteSettingsInput } from "@sfvypaa/content";
import { Eye, Save } from "lucide-react";

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
    <form action={formAction} className="grid gap-4.5">
      {state?.message ? (
        <p
          aria-live="polite"
          className={
            hasErrors
              ? "border-2 border-stop border-l-8 bg-card px-4 py-3 text-sm font-bold text-stop"
              : "border-2 border-go border-l-8 bg-card px-4 py-3 text-sm font-bold text-go"
          }
        >
          {state.message}
        </p>
      ) : null}

      <label className="flex cursor-pointer items-center gap-4.5 border-[3px] border-border bg-card p-5 text-card-foreground shadow-stamp">
        <span className="flex size-11 shrink-0 items-center justify-center border-[3px] border-border text-orange">
          <Eye className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold text-foreground">
            Show Instagram Socials on homepage
          </span>
          <span className="mt-1 block text-sm leading-normal text-text-soft">
            When on, the homepage shows the curated Social Posts section. Turn
            off to hide it entirely.
          </span>
        </span>
        {/* stamp switch: ink knob slides on an orange track */}
        <span className="relative inline-flex shrink-0">
          <input
            className="peer absolute inset-0 cursor-pointer opacity-0"
            defaultChecked={settings.showInstagramSocials}
            name="showInstagramSocials"
            type="checkbox"
          />
          <span className="flex h-[34px] w-16 items-center border-[3px] border-border bg-secondary p-[3px] transition-colors peer-checked:justify-end peer-checked:bg-orange peer-focus-visible:ring-3 peer-focus-visible:ring-ring/60">
            <span className="block size-6 bg-ink" />
          </span>
        </span>
      </label>

      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">
          <Save data-icon="inline-start" />
          {isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
