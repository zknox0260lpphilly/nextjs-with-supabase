import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, LOC_COOKIE, isLang } from "@/lib/i18n/constants";
import { isCountry } from "@/lib/ekip/geo";
import { getMyProfile, getUser } from "@/lib/ekip/queries";

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
  sameSite: "lax" as const,
};

// After signing in, copy the member's saved language and country from their
// profile into this device, so they skip the welcome screens.
export async function GET(request: NextRequest) {
  const user = await getUser();
  const profile = user ? await getMyProfile(user.id) : null;
  const store = await cookies();

  if (profile) {
    if (isLang(profile.language)) {
      store.set(LANG_COOKIE, profile.language, COOKIE_OPTIONS);
    }
    if (isCountry(profile.country)) {
      store.set(
        LOC_COOKIE,
        JSON.stringify({
          country: profile.country,
          region: profile.department ?? "",
          city: profile.city ?? "",
        }),
        COOKIE_OPTIONS,
      );
    }
  }
  return NextResponse.redirect(new URL("/", request.url));
}
