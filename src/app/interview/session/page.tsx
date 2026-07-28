import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InterviewSession } from "@/components/interview-session";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { currentMonthStart, getEntitlements } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import {
  isExperienceLevel,
  isInterviewDuration,
  isInterviewType,
} from "@/types/interview";

export const metadata: Metadata = {
  title: "Practice interview | Offerly",
  description: "Work through a focused mock interview session.",
};

type SessionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function InterviewSessionPage({
  searchParams,
}: SessionPageProps) {
  const params = await searchParams;
  const role = getValue(params.role).trim();
  const interviewType = getValue(params.type);
  const experience = getValue(params.experience);
  const duration = Number(getValue(params.duration));

  if (
    !role ||
    !isInterviewType(interviewType) ||
    !isExperienceLevel(experience) ||
    !isInterviewDuration(duration)
  ) {
    redirect("/interview/new");
  }

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect(`/login?next=${encodeURIComponent(`/interview/session?${new URLSearchParams({
        role,
        type: interviewType,
        experience,
        duration: String(duration),
      }).toString()}`)}`);
    }
    const entitlements = await getEntitlements(supabase, user.id);
    if (entitlements.monthlySessionLimit !== null) {
      const { count } = await supabase
        .from("interview_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", currentMonthStart());
      if ((count ?? 0) >= entitlements.monthlySessionLimit) {
        redirect("/dashboard/billing?limit=session");
      }
    }
  }

  return (
    <InterviewSession
      setup={{ role, interviewType, experience, duration }}
    />
  );
}
