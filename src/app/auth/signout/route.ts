import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Use 302 (not 307) so the browser switches to GET after the POST
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), { status: 302 });
}
