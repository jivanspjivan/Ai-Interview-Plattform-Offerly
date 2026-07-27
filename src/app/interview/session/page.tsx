import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InterviewSession } from "@/components/interview-session";
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

  return (
    <InterviewSession
      setup={{ role, interviewType, experience, duration }}
    />
  );
}
