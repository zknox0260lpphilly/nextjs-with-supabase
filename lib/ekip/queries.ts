import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import type { Lang, UserType } from "@/lib/i18n/constants";

// Reads from the Ekip database. If the database is missing or a query fails,
// these return an `error: true` result so pages can show a friendly message
// instead of crashing.

export type Poster = {
  display_name: string;
  user_type: UserType;
  organization_name: string | null;
  country: string | null;
  department: string | null;
  city: string | null;
  verified_at: string | null;
};

export type PostRow = {
  id: string;
  title: string;
  description: string | null;
  quantity: number;
  status: string;
  created_at: string;
  categories: { slug: string };
  profiles: Poster;
};

export type Area = { country?: string; region?: string };

export type CurrentUser = { id: string; email: string | null };

const POST_SELECT = (inner: boolean) =>
  `id,title,description,quantity,status,created_at,
   categories!inner(slug),
   profiles${inner ? "!inner" : ""}(display_name,user_type,organization_name,country,department,city,verified_at)`;

export async function getUser(): Promise<CurrentUser | null> {
  if (!hasEnvVars) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub) return null;
    return {
      id: claims.sub,
      email: typeof claims.email === "string" ? claims.email : null,
    };
  } catch {
    return null;
  }
}

type PostResult = { rows: PostRow[]; error: boolean };

async function listPosts(
  table: "requests" | "offers",
  opts: { cat?: string; area?: Area; limit?: number },
): Promise<PostResult> {
  if (!hasEnvVars) return { rows: [], error: true };
  try {
    const supabase = await createClient();
    const openStatus = table === "requests" ? "submitted" : "available";
    const filterArea = Boolean(opts.area?.country);
    let query = supabase
      .from(table)
      .select(POST_SELECT(filterArea))
      .eq("status", openStatus)
      .order("created_at", { ascending: false })
      .limit(opts.limit ?? 30);
    if (opts.cat) query = query.eq("categories.slug", opts.cat);
    if (opts.area?.country) query = query.eq("profiles.country", opts.area.country);
    if (opts.area?.region) query = query.eq("profiles.department", opts.area.region);
    const { data, error } = await query;
    if (error) return { rows: [], error: true };
    return { rows: (data ?? []) as unknown as PostRow[], error: false };
  } catch {
    return { rows: [], error: true };
  }
}

export const listRequests = (opts: {
  cat?: string;
  area?: Area;
  limit?: number;
}) => listPosts("requests", opts);

export const listOffers = (opts: {
  cat?: string;
  area?: Area;
  limit?: number;
}) => listPosts("offers", opts);

export type RequestDetail = PostRow & { requester_id: string };

export async function getRequest(
  id: string,
): Promise<{ row: RequestDetail | null; error: boolean }> {
  if (!hasEnvVars) return { row: null, error: true };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("requests")
      .select(`${POST_SELECT(true)},requester_id`)
      .eq("id", id)
      .maybeSingle();
    if (error) return { row: null, error: true };
    return { row: (data as unknown as RequestDetail) ?? null, error: false };
  } catch {
    return { row: null, error: true };
  }
}

export type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
};

export async function listResources(lang: Lang): Promise<Resource[]> {
  if (!hasEnvVars) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("educational_resources")
      .select("id,title,description,url")
      .eq("language", lang)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) return [];
    return (data ?? []) as Resource[];
  } catch {
    return [];
  }
}

export type MatchRow = {
  id: string;
  created_at: string;
  received_confirmed_at: string | null;
  requests: {
    id: string;
    title: string;
    requester_id: string;
    profiles: { display_name: string };
  };
  offers: {
    id: string;
    title: string;
    donor_id: string;
    profiles: { display_name: string };
  };
};

const MATCH_SELECT = `id,created_at,received_confirmed_at,
  requests!inner(id,title,requester_id,profiles!inner(display_name)),
  offers!inner(id,title,donor_id,profiles!inner(display_name))`;

export async function listMatches(): Promise<{
  rows: MatchRow[];
  error: boolean;
}> {
  if (!hasEnvVars) return { rows: [], error: true };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("matches")
      .select(MATCH_SELECT)
      .order("created_at", { ascending: false });
    if (error) return { rows: [], error: true };
    return { rows: (data ?? []) as unknown as MatchRow[], error: false };
  } catch {
    return { rows: [], error: true };
  }
}

export type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type Photo = { id: string; url: string };

export async function getChat(matchId: string): Promise<{
  match: MatchRow | null;
  messages: Message[];
  photos: Photo[];
  error: boolean;
}> {
  const empty = { match: null, messages: [], photos: [], error: true };
  if (!hasEnvVars) return empty;
  try {
    const supabase = await createClient();
    const { data: match, error } = await supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("id", matchId)
      .maybeSingle();
    if (error) return empty;
    if (!match) return { ...empty, error: false };

    const [{ data: messages }, { data: photoRows }] = await Promise.all([
      supabase
        .from("messages")
        .select("id,sender_id,body,created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true }),
      supabase
        .from("match_photos")
        .select("id,storage_path")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true }),
    ]);

    const rows = (photoRows ?? []) as { id: string; storage_path: string }[];
    let photos: Photo[] = [];
    if (rows.length > 0) {
      const { data: signed } = await supabase.storage
        .from("delivery-photos")
        .createSignedUrls(
          rows.map((r) => r.storage_path),
          3600,
        );
      photos = rows.flatMap((r, i) => {
        const url = signed?.[i]?.signedUrl;
        return url ? [{ id: r.id, url }] : [];
      });
    }

    return {
      match: match as unknown as MatchRow,
      messages: (messages ?? []) as Message[],
      photos,
      error: false,
    };
  } catch {
    return empty;
  }
}

export type MyProfile = {
  display_name: string;
  language: Lang;
  country: string | null;
  department: string | null;
  city: string | null;
  user_type: UserType;
  organization_name: string | null;
  verified_at: string | null;
};

export async function getMyProfile(userId: string): Promise<MyProfile | null> {
  if (!hasEnvVars) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select(
        "display_name,language,country,department,city,user_type,organization_name,verified_at",
      )
      .eq("id", userId)
      .maybeSingle();
    return (data as MyProfile | null) ?? null;
  } catch {
    return null;
  }
}

export async function isTeamMember(userId: string): Promise<boolean> {
  if (!hasEnvVars) return false;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

export type ReportRow = {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reported_profile_id: string | null;
  reported_offer_id: string | null;
  reported_request_id: string | null;
};

export async function listOpenReports(): Promise<ReportRow[]> {
  if (!hasEnvVars) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reports")
      .select(
        "id,reason,status,created_at,reported_profile_id,reported_offer_id,reported_request_id",
      )
      .neq("status", "closed")
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []) as ReportRow[];
  } catch {
    return [];
  }
}
