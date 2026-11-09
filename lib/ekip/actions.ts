"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import {
  LANG_COOKIE,
  LOC_COOKIE,
  isCategory,
  isLang,
  isUserType,
} from "@/lib/i18n/constants";
import { isCountry } from "./geo";

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
  sameSite: "lax" as const,
};

function text(formData: FormData, name: string, max: number): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Only allow redirects to pages inside this site.
function safeNext(next: string, fallback = "/"): string {
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
    ? next
    : fallback;
}

async function requireUser() {
  if (!hasEnvVars) redirect("/auth/login");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/auth/login");
  return { supabase, userId };
}

function withError(path: string): string {
  return `${path}${path.includes("?") ? "&" : "?"}e=1`;
}

// ---------------------------------------------------------------------
// Onboarding: language and location (stored in cookies, no account needed)
// ---------------------------------------------------------------------

export async function setLanguage(formData: FormData) {
  const lang = text(formData, "lang", 2);
  if (!isLang(lang)) redirect("/welcome/language");
  const store = await cookies();
  store.set(LANG_COOKIE, lang, COOKIE_OPTIONS);

  const next = text(formData, "next", 200);
  if (next) redirect(safeNext(next));
  redirect(store.get(LOC_COOKIE)?.value ? "/" : "/welcome/location");
}

export async function setLocation(formData: FormData) {
  const country = text(formData, "country", 2);
  if (!isCountry(country)) redirect(withError("/welcome/location"));
  const region = text(formData, "region", 80);
  const city = text(formData, "city", 80);
  (await cookies()).set(
    LOC_COOKIE,
    JSON.stringify({ country, region, city }),
    COOKIE_OPTIONS,
  );
  redirect("/");
}

// ---------------------------------------------------------------------
// Posting
// ---------------------------------------------------------------------

async function categoryId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
) {
  const { data } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

function readPost(formData: FormData) {
  const title = text(formData, "title", 120);
  const description = text(formData, "description", 1000);
  const quantity = Math.min(
    1000,
    Math.max(1, Math.floor(Number(text(formData, "quantity", 6)) || 1)),
  );
  const category = text(formData, "category", 40);
  return { title, description, quantity, category };
}

export async function createRequest(formData: FormData) {
  const { supabase } = await requireUser();
  const { title, description, quantity, category } = readPost(formData);
  if (!title || !isCategory(category)) redirect(withError("/post?type=need"));

  const category_id = await categoryId(supabase, category);
  if (!category_id) redirect(withError("/post?type=need"));

  const { data, error } = await supabase
    .from("requests")
    .insert({ category_id, title, description: description || null, quantity })
    .select("id")
    .single();
  if (error || !data) redirect(withError("/post?type=need"));

  revalidatePath("/", "layout");
  redirect(`/requests/${data.id}`);
}

export async function createOffer(formData: FormData) {
  const { supabase } = await requireUser();
  const { title, description, quantity, category } = readPost(formData);
  if (!title || !isCategory(category)) redirect(withError("/post?type=offer"));

  const category_id = await categoryId(supabase, category);
  if (!category_id) redirect(withError("/post?type=offer"));

  const { error } = await supabase
    .from("offers")
    .insert({ category_id, title, description: description || null, quantity });
  if (error) redirect(withError("/post?type=offer"));

  revalidatePath("/", "layout");
  redirect("/explore?type=offers");
}

// A donor accepts a request: create an offer for it, match the two, open the chat.
export async function offerHelp(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const requestId = text(formData, "request_id", 60);
  const note = text(formData, "note", 2000);
  const back = `/requests/${requestId}`;

  const { data: request } = await supabase
    .from("requests")
    .select("id,title,category_id,quantity,requester_id,status")
    .eq("id", requestId)
    .maybeSingle();
  if (!request || request.requester_id === userId || request.status !== "submitted") {
    redirect(withError(back));
  }

  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .insert({
      category_id: request.category_id,
      title: request.title,
      description: note || null,
      quantity: request.quantity,
    })
    .select("id")
    .single();
  if (offerError || !offer) redirect(withError(back));

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({ request_id: request.id, offer_id: offer.id })
    .select("id")
    .single();
  if (matchError || !match) {
    // Someone else matched first: remove the unused offer.
    await supabase.from("offers").delete().eq("id", offer.id);
    redirect(withError(back));
  }

  if (note) {
    await supabase.from("messages").insert({ match_id: match.id, body: note });
  }

  revalidatePath("/", "layout");
  redirect(`/messages/${match.id}`);
}

// ---------------------------------------------------------------------
// Chat and delivery
// ---------------------------------------------------------------------

export async function sendMessage(formData: FormData) {
  const { supabase } = await requireUser();
  const matchId = text(formData, "match_id", 60);
  const body = text(formData, "body", 2000);
  if (body) {
    const { error } = await supabase
      .from("messages")
      .insert({ match_id: matchId, body });
    if (error) redirect(withError(`/messages/${matchId}`));
  }
  revalidatePath(`/messages/${matchId}`);
  redirect(`/messages/${matchId}`);
}

export async function confirmReceipt(formData: FormData) {
  const { supabase } = await requireUser();
  const matchId = text(formData, "match_id", 60);
  const { error } = await supabase
    .from("matches")
    .update({ received_confirmed_at: new Date().toISOString() })
    .eq("id", matchId)
    .is("received_confirmed_at", null);
  if (error) redirect(withError(`/messages/${matchId}`));
  revalidatePath("/", "layout");
  redirect(`/messages/${matchId}`);
}

// ---------------------------------------------------------------------
// Safety
// ---------------------------------------------------------------------

export async function reportContent(formData: FormData) {
  const { supabase } = await requireUser();
  const kind = text(formData, "kind", 10);
  const id = text(formData, "id", 60);
  const reason = text(formData, "reason", 1000);
  const back = safeNext(text(formData, "back", 200));
  if (!reason || !["request", "offer", "profile"].includes(kind)) {
    redirect(withError(back));
  }
  const target =
    kind === "request"
      ? { reported_request_id: id }
      : kind === "offer"
        ? { reported_offer_id: id }
        : { reported_profile_id: id };
  const { error } = await supabase.from("reports").insert({ ...target, reason });
  if (error) redirect(withError(back));
  redirect(`${back}${back.includes("?") ? "&" : "?"}reported=1`);
}

export async function updateReportStatus(formData: FormData) {
  const { supabase } = await requireUser();
  const id = text(formData, "id", 60);
  const status = text(formData, "status", 12);
  if (["reviewing", "closed"].includes(status)) {
    await supabase.from("reports").update({ status }).eq("id", id);
  }
  revalidatePath("/moderation");
  redirect("/moderation");
}

// ---------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------

export async function updateProfile(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const language = text(formData, "language", 2);
  const country = text(formData, "country", 2);
  const userType = text(formData, "user_type", 20);
  if (!isLang(language) || !isCountry(country) || !isUserType(userType)) {
    redirect(withError("/profile"));
  }
  const region = text(formData, "region", 80);
  const city = text(formData, "city", 80);

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: text(formData, "display_name", 60),
      language,
      country,
      department: region || null,
      city: city || null,
      user_type: userType,
      organization_name: text(formData, "organization_name", 100) || null,
    })
    .eq("id", userId);
  if (error) redirect(withError("/profile"));

  const store = await cookies();
  store.set(LANG_COOKIE, language, COOKIE_OPTIONS);
  store.set(LOC_COOKIE, JSON.stringify({ country, region, city }), COOKIE_OPTIONS);
  revalidatePath("/", "layout");
  redirect("/profile?saved=1");
}
