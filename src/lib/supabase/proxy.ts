import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { hasSupabaseConfig, getSupabaseConfig } from "./config";

const protectedRoutes = ["/dashboard", "/update-password"];
const guestOnlyRoutes = ["/login", "/register"];

export async function updateSession(request: NextRequest, traceId: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-trace-id", traceId);
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-trace-id", traceId);

  if (!hasSupabaseConfig()) {
    return response;
  }

  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request: { headers: requestHeaders } });
          response.headers.set("x-trace-id", traceId);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isGuestOnly = guestOnlyRoutes.includes(pathname);

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.headers.set("x-trace-id", traceId);
    return redirectResponse;
  }

  if (user && isGuestOnly) {
    const redirectResponse = NextResponse.redirect(
      new URL("/dashboard", request.url),
    );
    redirectResponse.headers.set("x-trace-id", traceId);
    return redirectResponse;
  }

  return response;
}
