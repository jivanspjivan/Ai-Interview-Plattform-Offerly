import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  enforceRateLimit,
  parseJsonBody,
  sameOriginError,
} from "@/lib/api-security";
import { getTraceId, logContext, logger } from "@/lib/logger";
import { queueEmail } from "@/lib/email";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const traceId = getTraceId(request);
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Persistence is not configured." }, { status: 503 });
  }

  const { sessionId } = await params;
  const parsedBody = await parseJsonBody<Record<string, unknown>>(request, 4 * 1024);
  if ("response" in parsedBody) return parsedBody.response;
  const body = parsedBody.data;
  const status = body.status;
  const elapsedSeconds = Number(body.elapsedSeconds);
  const currentQuestion = Number(body.currentQuestion ?? 0);

  if (
    (status !== "completed" && status !== "abandoned" && status !== "in_progress") ||
    !Number.isInteger(elapsedSeconds) ||
    elapsedSeconds < 0 ||
    !Number.isInteger(currentQuestion) ||
    currentQuestion < 0
  ) {
    return NextResponse.json({ error: "Invalid session update." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const rateLimitError = await enforceRateLimit(request, {
    action: "sessions-update",
    limit: 60,
    windowSeconds: 10 * 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;
  const { data: previousSession } = await supabase
    .from("interview_sessions")
    .select("status")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("interview_sessions")
    .update({
      status,
      elapsed_seconds: elapsedSeconds,
      current_question: currentQuestion,
      paused_at: status === "in_progress" ? new Date().toISOString() : null,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    logger.error(
      "Interview session status update failed.",
      logContext({
        file: "src/app/api/sessions/[sessionId]/route.ts",
        function: "PATCH",
        traceId,
        key: "sessions.status_update_failed",
        status,
        elapsedSeconds,
        error,
      }),
    );
    return NextResponse.json({ error: "The session could not be updated." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  if (status === "completed" && previousSession?.status !== "completed" && user.email) {
    void queueEmail({
      userId: user.id,
      recipient: user.email,
      template: "interview_completed",
      subject: "Your Offerly interview report is ready",
      payload: { name: user.user_metadata?.full_name ?? "there" },
    });
  }

  return NextResponse.json({ saved: true });
}
