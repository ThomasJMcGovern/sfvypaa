"use server";

import {
  getAdmin,
  getAdminAuth,
  removeAdmin,
  setAdmin,
  type AdminRole,
} from "@sfvypaa/content";
import { revalidatePath } from "next/cache";

import { adminToActor, requireOwner } from "@/lib/admin-session";

export type TeamActionState = { message?: string; error?: boolean } | null;

function role(value: FormDataEntryValue | null): AdminRole {
  return value === "owner" ? "owner" : "admin";
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveTeamMemberAction(
  _previous: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const owner = await requireOwner();

  const email = text(formData, "email");
  const name = text(formData, "name");

  if (!email || !email.includes("@")) {
    return { error: true, message: "Enter a valid email address." };
  }

  try {
    await setAdmin(
      { email, name: name || email, role: role(formData.get("role")) },
      adminToActor(owner),
    );
  } catch (error) {
    return {
      error: true,
      message: error instanceof Error ? error.message : "Couldn't save member.",
    };
  }

  revalidatePath("/team");
  return { message: `Saved ${email}.` };
}

export async function removeTeamMemberAction(formData: FormData) {
  const owner = await requireOwner();
  const email = text(formData, "email");

  if (email) {
    const target = await getAdmin(email);

    await removeAdmin(email, adminToActor(owner));

    // Kill their live sessions immediately — the disgruntled-admin switch.
    if (target) {
      try {
        const user = await getAdminAuth().getUserByEmail(email);
        await getAdminAuth().revokeRefreshTokens(user.uid);
      } catch {
        // user may have never signed in — nothing to revoke
      }
    }
  }

  revalidatePath("/team");
}
