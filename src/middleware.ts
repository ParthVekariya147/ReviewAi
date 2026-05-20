import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const supabaseConfigured =
  supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://");

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  if (!supabaseConfigured) {
    return supabaseResponse;
  }

  let response = supabaseResponse;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const DASHBOARD = "/app/business_dashboard";

  // ── 1. Unauthenticated → redirect to login ──────────────────────────────
  // /reset-password requires an active Supabase recovery session
  if (!user && pathname === "/reset-password") {
    const url = request.nextUrl.clone();
    url.pathname = "/forgot-password";
    url.searchParams.set("error", "session_expired");
    return NextResponse.redirect(url);
  }
  if (!user && pathname.startsWith(DASHBOARD)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", DASHBOARD);
    return NextResponse.redirect(url);
  }

  if (!user && pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ── 2. Admin route — require admin role ─────────────────────────────────
  if (user && pathname.startsWith("/admin")) {
    const role = user.user_metadata?.role as string | undefined;
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = DASHBOARD;
      url.searchParams.set("error", "access_denied");
      return NextResponse.redirect(url);
    }
  }

  // ── 3. Logged-in user → redirect away from auth pages ───────────────────
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = DASHBOARD;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
