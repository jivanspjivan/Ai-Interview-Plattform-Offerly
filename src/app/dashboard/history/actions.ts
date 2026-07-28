"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function deleteSession(sessionId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("interview_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);
  redirect("/dashboard/history");
}
