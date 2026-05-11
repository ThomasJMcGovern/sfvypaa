"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useFormStatus } from "react-dom";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteConfirmationDialogProps = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  resourceName: string;
  resourceType: "event" | "newsletter";
};

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-14 w-full rounded-[14px] bg-[#ff6b70] px-6 text-lg font-black text-[#130d0d] hover:bg-[#ff7b80] sm:h-[4.4rem] sm:text-xl"
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}

export function DeleteConfirmationDialog({
  action,
  id,
  resourceName,
  resourceType,
}: DeleteConfirmationDialogProps) {
  const trimmedName = resourceName.trim();
  const fallbackName = `this ${resourceType}`;
  const displayName = trimmedName || fallbackName;
  const triggerLabel =
    resourceType === "event" ? "Delete event" : "Delete newsletter";

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="inline-flex h-10 shrink-0 items-center justify-center rounded-[8px] border border-transparent bg-destructive/10 px-4 text-sm font-medium whitespace-nowrap text-destructive transition-all outline-none hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-3 focus-visible:ring-destructive/20 active:translate-y-px">
        {triggerLabel}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[3px]" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),48rem)] -translate-x-1/2 -translate-y-1/2 gap-8 overflow-y-auto rounded-[2rem] bg-[#111111] p-6 text-white shadow-2xl shadow-black/50 sm:gap-12 sm:rounded-[3rem] sm:p-11">
          <AlertDialog.Close className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30 sm:right-9 sm:top-9">
            <X className="size-8" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </AlertDialog.Close>

          <div className="grid max-w-[39rem] gap-7 pr-12 sm:pr-14">
            <AlertDialog.Title className="text-3xl font-black leading-tight tracking-normal sm:text-4xl">
              {trimmedName ? (
                <>
                  Delete {resourceType} &ldquo;{displayName}&rdquo;?
                </>
              ) : (
                <>Delete {fallbackName}?</>
              )}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-xl leading-8 text-white/88 sm:text-2xl sm:leading-10">
              {trimmedName ? (
                <>
                  Deleting &ldquo;{displayName}&rdquo; will permanently remove
                  this {resourceType}. This cannot be undone.
                </>
              ) : (
                <>
                  Deleting this {resourceType} will permanently remove it. This
                  cannot be undone.
                </>
              )}
            </AlertDialog.Description>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <AlertDialog.Close className="inline-flex h-14 items-center justify-center rounded-[14px] bg-white/8 px-6 text-lg font-black text-white/58 transition hover:bg-white/12 hover:text-white/76 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/24 sm:h-[4.4rem] sm:text-xl">
              Cancel
            </AlertDialog.Close>
            <form action={action} className="flex">
              <input type="hidden" name="id" value={id} />
              <DeleteSubmitButton />
            </form>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
