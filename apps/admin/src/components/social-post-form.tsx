"use client";

import { useActionState } from "react";
import type { SocialPostInput } from "@valleypaa/content";

import {
  deleteSocialPostAction,
  saveSocialPostAction,
  type AdminActionState,
} from "@/app/actions";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import {
  DateField,
  Field,
  FieldGroup,
  FormMessage,
  ImageUploadField,
  PublishingActions,
  TextArea,
} from "@/components/form-fields";

const initialState: AdminActionState = null;

export function SocialPostForm({
  post,
  publicSiteUrl,
}: {
  post: SocialPostInput;
  publicSiteUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(
    saveSocialPostAction,
    initialState,
  );
  const fieldErrors = state?.fieldErrors ?? {};
  const isPublished = post.status === "published";

  return (
    <form action={formAction} className="grid gap-5 pb-16">
      <FormMessage message={state?.message} />
      <input type="hidden" name="id" value={post.id ?? ""} />

      <FieldGroup title="Basics">
        <Field
          label="Title"
          name="title"
          defaultValue={post.title}
          error={fieldErrors.title}
          required
        />
        <div className="grid gap-4.5 md:grid-cols-2">
          <DateField
            defaultValue={post.postDate}
            error={fieldErrors.postDate}
            label="Post date"
            name="postDate"
          />
          <Field
            label="Instagram link"
            name="instagramUrl"
            defaultValue={post.instagramUrl}
            error={fieldErrors.instagramUrl}
            mono
            placeholder="https://www.instagram.com/p/..."
            required
            type="url"
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Caption">
        <TextArea
          label="Caption"
          name="caption"
          defaultValue={post.caption}
          error={fieldErrors.caption}
          required
          rows={5}
        />
      </FieldGroup>

      <FieldGroup title="Image">
        <ImageUploadField
          aspect="1/1"
          defaultValue={post.imageUrl}
          error={fieldErrors.imageFile || fieldErrors.imageUrl}
          label="Post image"
        />
      </FieldGroup>

      <PublishingActions
        isPending={isPending}
        isPublished={isPublished}
        publicHref={`${publicSiteUrl}/#socials`}
      />
    </form>
  );
}

export function DeleteSocialPostForm({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <DeleteConfirmationDialog
      action={deleteSocialPostAction}
      id={id}
      resourceName={title}
      resourceType="social post"
    />
  );
}
