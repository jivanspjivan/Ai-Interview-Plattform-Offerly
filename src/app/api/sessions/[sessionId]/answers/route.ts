import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { InterviewFeedback } from "@/types/interview-feedback";
import {
  enforceRateLimit,
  parseJsonBody,
  sameOriginError,
} from "@/lib/api-security";
import { getTraceId, logContext, logger } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

function isFeedback(value: unknown): value is InterviewFeedback {
  if (!value || typeof value !== "object") return false;
  const feedback = value as Partial<InterviewFeedback>;
  const scores = feedback.scores;
  return (
    typeof feedback.overallScore === "number" &&
    typeof feedback.summary === "string" &&
    Boolean(scores) &&
    typeof scores?.structure === "number" &&
    typeof scores.relevance === "number" &&
    typeof scores.clarity === "number" &&
    typeof scores.evidence === "number" &&
    Array.isArray(feedback.strengths) &&
    Array.isArray(feedback.improvements) &&
    typeof feedback.nextStep === "string"
  );
}

export async function PUT(request: Request, { params }: RouteContext) {
  const traceId = getTraceId(request);
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Persistence is not configured." }, { status: 503 });
  }

  const { sessionId } = await params;
  const parsedBody = await parseJsonBody<Record<string, unknown>>(request, 32 * 1024);
  if ("response" in parsedBody) return parsedBody.response;
  const body = parsedBody.data;
  const questionId =
    typeof body.questionId === "string" ? body.questionId.trim() : "";
  const questionPrompt =
    typeof body.questionPrompt === "string" ? body.questionPrompt.trim() : "";
  const questionType = body.questionType;
  const transcript =
    typeof body.transcript === "string" ? body.transcript.trim() : null;
  const feedback = body.feedback;

  if (
    !questionId ||
    !questionPrompt ||
    (questionType !== "behavioral" && questionType !== "technical") ||
    (feedback !== undefined && !isFeedback(feedback))
  ) {
    return NextResponse.json({ error: "Invalid answer data." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const rateLimitError = await enforceRateLimit(request, {
    action: "answers-save",
    limit: 120,
    windowSeconds: 10 * 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;

  const { data: session } = await supabase
    .from("interview_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const { data: answer, error: answerError } = await supabase
    .from("interview_answers")
    .upsert(
      {
        session_id: sessionId,
        user_id: user.id,
        question_id: questionId,
        question_prompt: questionPrompt,
        question_type: questionType,
        transcript,
      },
      { onConflict: "session_id,question_id" },
    )
    .select("id")
    .single();

  if (answerError) {
    logger.error(
      "Interview answer persistence failed.",
      logContext({
        file: "src/app/api/sessions/[sessionId]/answers/route.ts",
        function: "PUT",
        traceId,
        key: "answers.save_failed",
        questionType,
        hasTranscript: Boolean(transcript),
        error: answerError,
      }),
    );
    return NextResponse.json({ error: "The answer could not be saved." }, { status: 500 });
  }

  if (isFeedback(feedback)) {
    const { error: feedbackError } = await supabase
      .from("interview_feedback")
      .upsert(
        {
          answer_id: answer.id,
          user_id: user.id,
          overall_score: feedback.overallScore,
          summary: feedback.summary,
          structure_score: feedback.scores.structure,
          relevance_score: feedback.scores.relevance,
          clarity_score: feedback.scores.clarity,
          evidence_score: feedback.scores.evidence,
          strengths: feedback.strengths,
          improvements: feedback.improvements,
          next_step: feedback.nextStep,
        },
        { onConflict: "answer_id" },
      );

    if (feedbackError) {
      logger.error(
        "Interview feedback persistence failed.",
        logContext({
          file: "src/app/api/sessions/[sessionId]/answers/route.ts",
          function: "PUT",
          traceId,
          key: "feedback.save_failed",
          error: feedbackError,
        }),
      );
      return NextResponse.json({ error: "Feedback could not be saved." }, { status: 500 });
    }
  }

  return NextResponse.json({ answerId: answer.id });
}
