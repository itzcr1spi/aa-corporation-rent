"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn } from "@/lib/auth/config";

export type LoginState = { error?: boolean };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      ip,
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    // AuthError = bad credentials → generic message. Anything else (e.g. the
    // NEXT_REDIRECT thrown on success) must propagate.
    if (error instanceof AuthError) return { error: true };
    throw error;
  }
}
