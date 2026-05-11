import type { NewsletterInput } from "@sfvypaa/content";

import { deleteNewsletterAction, saveNewsletterAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm({
  newsletter,
}: {
  newsletter: NewsletterInput;
}) {
  return (
    <form action={saveNewsletterAction} className="grid gap-5">
      <input type="hidden" name="id" value={newsletter.id ?? ""} />
      <Field label="Title" name="title" defaultValue={newsletter.title} required />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Slug" name="slug" defaultValue={newsletter.slug} />
        <Field
          label="Publish date"
          name="publishDate"
          defaultValue={newsletter.publishDate}
          required
        />
      </div>
      <Select
        label="Status"
        name="status"
        defaultValue={newsletter.status}
        options={["draft", "published"]}
      />
      <TextArea
        label="Excerpt"
        name="excerpt"
        defaultValue={newsletter.excerpt}
        required
        rows={3}
      />
      <TextArea
        label="Body"
        name="body"
        defaultValue={newsletter.body}
        required
        rows={14}
      />
      <Button
        type="submit"
        className="h-11 w-fit rounded-[8px] bg-[#ffcf6b] px-5 text-[#191109] hover:bg-[#f3b83f]"
      >
        Save newsletter
      </Button>
    </form>
  );
}

export function DeleteNewsletterForm({ id }: { id: string }) {
  return (
    <form action={deleteNewsletterAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="destructive"
        className="h-10 rounded-[8px] px-4"
      >
        Delete newsletter
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <Input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="h-11 rounded-[8px] border-white/15 bg-white px-3 text-[#171310]"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  required,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  rows: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={rows}
        className="w-full rounded-[8px] border border-white/15 bg-white px-3 py-3 text-base leading-7 text-[#171310] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/72">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-11 rounded-[8px] border border-white/15 bg-white px-3 text-[#171310] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
