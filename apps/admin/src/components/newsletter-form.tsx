"use client";

import { useActionState } from "react";
import type { NewsletterInput } from "@sfvypaa/content";

import {
  deleteNewsletterAction,
  saveNewsletterAction,
  type AdminActionState,
} from "@/app/actions";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import {
  DateField,
  Field,
  FieldGroup,
  FormMessage,
  PublishingActions,
  TextArea,
} from "@/components/form-fields";

const initialState: AdminActionState = null;

function slugifyForPath(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewsletterForm({
  newsletter,
  publicSiteUrl,
}: {
  newsletter: NewsletterInput;
  publicSiteUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(
    saveNewsletterAction,
    initialState,
  );
  const fieldErrors = state?.fieldErrors ?? {};
  const previewSlug = slugifyForPath(newsletter.slug || newsletter.title);
  const isPublished = newsletter.status === "published";

  return (
    <form action={formAction} className="grid gap-5 pb-16">
      <FormMessage message={state?.message} />
      <input type="hidden" name="id" value={newsletter.id ?? ""} />

      <FieldGroup title="Basics">
        <Field
          label="Title"
          name="title"
          defaultValue={newsletter.title}
          error={fieldErrors.title}
          required
        />
        <div className="grid gap-4.5 md:grid-cols-2">
          <Field
            label="URL slug"
            name="slug"
            defaultValue={newsletter.slug}
            error={fieldErrors.slug}
            mono
            placeholder="auto-generated from title"
          />
          <DateField
            defaultValue={newsletter.publishDate}
            error={fieldErrors.publishDate}
            label="Publish date"
            name="publishDate"
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Content">
        <TextArea
          label="Excerpt"
          name="excerpt"
          defaultValue={newsletter.excerpt}
          error={fieldErrors.excerpt}
          required
          rows={3}
        />
        <TextArea
          label="Body"
          name="body"
          defaultValue={newsletter.body}
          error={fieldErrors.body}
          required
          rows={14}
        />
      </FieldGroup>

      <PublishingActions
        isPending={isPending}
        isPublished={isPublished}
        publicHref={
          previewSlug ? `${publicSiteUrl}/newsletters/${previewSlug}` : ""
        }
      />
    </form>
  );
}

export function DeleteNewsletterForm({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <DeleteConfirmationDialog
      action={deleteNewsletterAction}
      id={id}
      resourceName={title}
      resourceType="newsletter"
    />
  );
}
