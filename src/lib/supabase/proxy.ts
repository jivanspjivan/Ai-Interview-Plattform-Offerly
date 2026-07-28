import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfig, getSupabaseConfig } from "./config";

const protectedRoutes = ["/dashboard", "/update-password"];
const guestOnlyRoutes = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!hasSupabaseConfig()) {
    return response;
  }

  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

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
    return NextResponse.redirect(loginUrl);
  }

  if (user && isGuestOnly) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
