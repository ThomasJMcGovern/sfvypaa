"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useFormStatus } from "react-dom";
import { Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DeleteConfirmationDialogProps = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  resourceName: string;
  resourceType: "event" | "newsletter" | "social post";
};

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="destructive">
      <Trash2 data-icon="inline-start" />
      {pending ? "Deleting…" : "Delete for good"}
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

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="inline-flex h-8 shrink-0 items-center justify-center gap-1 border-[3px] border-ink bg-stop px-3 text-[0.8125rem] font-bold tracking-[0.06em] whitespace-nowrap text-paper uppercase shadow-stamp transition-[transform,box-shadow] duration-100 outline-none hover:translate-x-px hover:translate-y-px hover:shadow-stamp-sm focus-visible:ring-3 focus-visible:ring-ring/60 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none [&_svg]:size-3.5">
        <Trash2 aria-hidden="true" />
        Delete
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-ink/70" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 gap-3 overflow-y-auto border-[5px] border-border bg-card p-7 text-card-foreground shadow-stamp-lg">
          <div className="flex items-start justify-between">
            <Badge className="border-stop bg-stop text-paper">Delete</Badge>
            <AlertDialog.Close className="inline-flex size-8 items-center justify-center text-foreground transition-colors hover:text-stop focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/60">
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </AlertDialog.Close>
          </div>

          <AlertDialog.Title className="font-display text-3xl leading-[0.95] text-foreground uppercase">
            Delete this?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-[15px] leading-relaxed text-text-soft">
            You&apos;re about to permanently delete{" "}
            <strong className="text-foreground">{displayName}</strong>. This
            can&apos;t be undone, and it&apos;ll disappear from the public site.
          </AlertDialog.Description>

          <div className="mt-3 flex flex-wrap justify-end gap-3">
            <AlertDialog.Close
              nativeButton={false}
              render={<Button variant="outline" />}
            >
              Keep it
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
