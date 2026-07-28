import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { currentMonthStart, getEntitlements } from "@/lib/entitlements";
import {
  isExperienceLevel,
  isInterviewDuration,
  isInterviewType,
} from "@/types/interview";
import {
  enforceRateLimit,
  parseJsonBody,
  sameOriginError,
} from "@/lib/api-security";

export async function GET(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Persistence is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const rateLimitError = await enforceRateLimit(request, {
    action: "sessions-read",
    limit: 120,
    windowSeconds: 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;

  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Sessions could not be loaded." }, { status: 500 });
  }

  return NextResponse.json({ sessions: data });
}

export async function POST(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Persistence is not configured." }, { status: 503 });
  }

  const parsedBody = await parseJsonBody<Record<string, unknown>>(request, 8 * 1024);
  if ("response" in parsedBody) return parsedBody.response;
  const body = parsedBody.data;
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const interviewType =
    typeof body.interviewType === "string" ? body.interviewType : "";
  const experience =
    typeof body.experience === "string" ? body.experience : "";
  const duration = Number(body.duration);
  const questionCount = Number(body.questionCount);

  if (
    !role ||
    role.length > 120 ||
    !isInterviewType(interviewType) ||
    !isExperienceLevel(experience) ||
    !isInterviewDuration(duration) ||
    !Number.isInteger(questionCount) ||
    questionCount < 1 ||
    questionCount > 50
  ) {
    return NextResponse.json({ error: "Invalid session configuration." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const rateLimitError = await enforceRateLimit(request, {
    action: "sessions-create",
    limit: 20,
    windowSeconds: 10 * 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;

  const entitlements = await getEntitlements(supabase, user.id);
  if (entitlements.monthlySessionLimit !== null) {
    const { count } = await supabase
      .from("interview_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", currentMonthStart());
    if ((count ?? 0) >= entitlements.monthlySessionLimit) {
      return NextResponse.json(
        {
          error: `Your ${entitlements.name} plan includes ${entitlements.monthlySessionLimit} sessions each month.`,
          upgradeUrl: "/dashboard/billing",
        },
        { status: 402 },
      );
    }
  }

  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({
      user_id: user.id,
      role,
      interview_type: interviewType,
      experience_level: experience,
      planned_duration: duration,
      question_count: questionCount,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "The session could not be saved." }, { status: 500 });
  }

  return NextResponse.json({ sessionId: data.id }, { status: 201 });
}
