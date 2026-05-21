import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentBusiness } from '@/lib/businesses/current';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app/business_dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      // New user with no business → send to onboarding
      const { business: biz } = await getCurrentBusiness(supabase, session.user.id);

      const dest = biz?.onboarding_complete ? next : '/app/onboarding';
      return NextResponse.redirect(new URL(dest, origin));
    }

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }

    // Code exchange failed — redirect to error page
    return NextResponse.redirect(
      new URL(`/login?error=auth_error&message=${encodeURIComponent(error.message)}`, origin)
    );
  }

  // No code — something went wrong
  return NextResponse.redirect(new URL("/login?error=missing_code", origin));
}
