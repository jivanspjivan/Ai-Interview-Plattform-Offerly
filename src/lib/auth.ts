import { cache } from "react";
import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const requireUser = cache(async () => {
  if (!hasSupabaseConfig()) {
    redirect("/login?error=configuration");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return user;
});

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowedEmails.includes(email.toLowerCase());
}

export const requireAdmin = cache(async () => {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }
  return user;
});
