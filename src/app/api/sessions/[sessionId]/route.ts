import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Persistence is not configured." }, { status: 503 });
  }

  const { sessionId } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const status = body.status;
  const elapsedSeconds = Number(body.elapsedSeconds);

  if (
    (status !== "completed" && status !== "abandoned") ||
    !Number.isInteger(elapsedSeconds) ||
    elapsedSeconds < 0
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

  const { data, error } = await supabase
    .from("interview_sessions")
    .update({
      status,
      elapsed_seconds: elapsedSeconds,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "The session could not be updated." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ saved: true });
}
