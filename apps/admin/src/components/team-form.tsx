"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";

import { saveTeamMemberAction, type TeamActionState } from "@/app/team/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: TeamActionState = null;

export function TeamForm() {
  const [state, formAction, isPending] = useActionState(
    saveTeamMemberAction,
    initial,
  );

  return (
    <form
      action={formAction}
      className="border-[3px] border-border bg-card p-6 text-card-foreground shadow-stamp"
    >
      <h2 className="mb-5 text-2xl text-foreground">Add or update a member</h2>
      {state?.message ? (
        <p
          className={`mb-4 border-2 border-l-8 bg-card px-4 py-3 text-sm font-bold ${
            state.error ? "border-stop text-stop" : "border-go text-go"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-4.5 sm:grid-cols-[1fr_1fr_10rem]">
        <label className="grid gap-2">
          <span className="label-stamp text-foreground">Name</span>
          <Input className="h-11" name="name" placeholder="First L." />
        </label>
        <label className="grid gap-2">
          <span className="label-stamp text-foreground">Google email</span>
          <Input
            className="h-11 font-mono"
            name="email"
            placeholder="name@gmail.com"
            required
            type="email"
          />
        </label>
        <label className="grid gap-2">
          <span className="label-stamp text-foreground">Role</span>
          <select
            className="h-11 rounded-[2px] border-2 border-input bg-card px-3 font-medium text-foreground outline-none focus-visible:shadow-[3px_3px_0_0_var(--ring)]"
            defaultValue="admin"
            name="role"
          >
            <option value="admin">admin</option>
            <option value="owner">owner</option>
          </select>
        </label>
      </div>
      <div className="mt-4.5">
        <Button disabled={isPending} type="submit">
          <UserPlus data-icon="inline-start" />
          {isPending ? "Saving…" : "Save member"}
        </Button>
      </div>
    </form>
  );
}
