import { updateSession } from "@/lib/supabase/proxy";
import { LANG_COOKIE, LOC_COOKIE } from "@/lib/i18n/constants";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // First visit: welcome screen, then language, then country, before anything
  // else. Sign-in pages are open so returning members can sign in right away.
  if (!pathname.startsWith("/welcome") && !pathname.startsWith("/auth")) {
    const needs = !request.cookies.get(LANG_COOKIE)?.value
      ? "/welcome"
      : !request.cookies.get(LOC_COOKIE)?.value
        ? "/welcome/location"
        : null;
    if (needs) {
      const url = request.nextUrl.clone();
      url.pathname = needs;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
