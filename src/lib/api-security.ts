import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RateLimitOptions = {
  action: string;
  limit: number;
  windowSeconds: number;
  userId?: string;
};

export function getClientAddress(request: Request) {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export function rateLimitIdentifier(request: Request, userId?: string) {
  const subject = userId
    ? `user:${userId}`
    : `ip:${getClientAddress(request)}`;
  return createHash("sha256").update(subject).digest("hex");
}

export function validateSameOrigin(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function sameOriginError(request: Request) {
  return validateSameOrigin(request)
    ? null
    : NextResponse.json(
        { error: "Cross-site requests are not allowed." },
        { status: 403 },
      );
}

export function exceedsContentLength(request: Request, maximumBytes: number) {
  const value = request.headers.get("content-length");
  if (!value) return false;
  const length = Number(value);
  return !Number.isFinite(length) || length < 0 || length > maximumBytes;
}

export async function parseJsonBody<T>(request: Request, maximumBytes: number) {
  if (exceedsContentLength(request, maximumBytes)) {
    return {
      response: NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 },
      ),
    } as const;
  }
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > maximumBytes) {
    return {
      response: NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 },
      ),
    } as const;
  }
  try {
    return { data: JSON.parse(rawBody) as T } as const;
  } catch {
    return {
      response: NextResponse.json(
        { error: "The request body must be valid JSON." },
        { status: 400 },
      ),
    } as const;
  }
}

export async function enforceRateLimit(
  request: Request,
  options: RateLimitOptions,
) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("consume_rate_limit", {
      p_identifier: rateLimitIdentifier(request, options.userId),
      p_action: options.action,
      p_limit: options.limit,
      p_window_seconds: options.windowSeconds,
    });
    if (error || !data?.[0]) {
      console.error("Rate limit storage failed", error);
      return NextResponse.json(
        { error: "Request protection is temporarily unavailable." },
        { status: 503 },
      );
    }

    const result = data[0];
    if (result.allowed) return null;
    const retryAfter = Math.max(
      1,
      Math.ceil((new Date(result.reset_at).getTime() - Date.now()) / 1000),
    );
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(options.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.reset_at,
        },
      },
    );
  } catch (error) {
    console.error("Rate limit enforcement failed", error);
    return NextResponse.json(
      { error: "Request protection is temporarily unavailable." },
      { status: 503 },
    );
  }
}
