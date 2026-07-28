import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { randomUUID } from "node:crypto";

export async function proxy(request: NextRequest) {
  const incomingTraceId = request.headers.get("x-trace-id");
  const traceId =
    incomingTraceId && /^[a-zA-Z0-9_-]{8,80}$/.test(incomingTraceId)
      ? incomingTraceId
      : randomUUID();
  return updateSession(request, traceId);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/update-password",
    "/api/:path*",
  ],
};
