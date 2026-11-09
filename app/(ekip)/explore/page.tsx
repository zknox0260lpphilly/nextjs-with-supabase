import Link from "next/link";
import { Suspense } from "react";
import { Notice } from "@/components/ekip/fields";
import { PageSkeleton, PageTitle } from "@/components/ekip/page-bits";
import { PostCard } from "@/components/ekip/post-card";
import { cn } from "@/lib/utils";
import { CATEGORY_SLUGS, isCategory } from "@/lib/i18n/constants";
import { getLocation, getT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translations";
import { listOffers, listRequests } from "@/lib/ekip/queries";

type Params = { type?: string; cat?: string; area?: string };
type AreaMode = "mine" | "haiti" | "all";

function href(params: Params): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

function Chip({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card hover:border-primary hover:bg-accent",
      )}
    >
      {children}
    </Link>
  );
}

async function Explore({ searchParams }: { searchParams: Promise<Params> }) {
  const [{ t }, location, raw] = await Promise.all([
    getT(),
    getLocation(),
    searchParams,
  ]);

  const type = raw.type === "offers" ? "offers" : "needs";
  const cat = isCategory(raw.cat) ? raw.cat : undefined;
  // Most requests come from Haiti. Someone in Haiti starts with their own
  // area; someone abroad starts with Haiti, where they can send help.
  const inHaiti = location?.country === "HT";
  const fallbackMode: AreaMode = !location ? "all" : inHaiti ? "mine" : "haiti";
  const requested = ["mine", "haiti", "all"].includes(raw.area ?? "")
    ? (raw.area as AreaMode)
    : fallbackMode;
  const mode: AreaMode = location || requested === "all" ? requested : "all";
  const area =
    mode === "mine" && location
      ? { country: location.country, region: location.region || undefined }
      : mode === "haiti"
        ? { country: "HT" }
        : undefined;

  const result =
    type === "offers"
      ? await listOffers({ cat, area })
      : await listRequests({ cat, area });

  const base: Params = {
    type: type === "offers" ? "offers" : undefined,
    cat,
    area: raw.area,
  };

  return (
    <div>
      <PageTitle>{t("exploreTitle")}</PageTitle>

      <div className="grid gap-3">
        <div className="flex gap-2">
          <Chip to={href({ ...base, type: undefined })} active={type === "needs"}>
            {t("showNeeds")}
          </Chip>
          <Chip to={href({ ...base, type: "offers" })} active={type === "offers"}>
            {t("showOffers")}
          </Chip>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip to={href({ ...base, cat: undefined })} active={!cat}>
            {t("allCategories")}
          </Chip>
          {CATEGORY_SLUGS.map((slug) => (
            <Chip key={slug} to={href({ ...base, cat: slug })} active={cat === slug}>
              {t(`cat_${slug}` as TranslationKey)}
            </Chip>
          ))}
        </div>

        {location ? (
          <div className="flex flex-wrap gap-2">
            {!inHaiti ? (
              <Chip to={href({ ...base, area: "haiti" })} active={mode === "haiti"}>
                {t("inHaiti")}
              </Chip>
            ) : null}
            <Chip to={href({ ...base, area: "mine" })} active={mode === "mine"}>
              {inHaiti ? t("myArea") : t("myCountry")}
            </Chip>
            <Chip to={href({ ...base, area: "all" })} active={mode === "all"}>
              {t("everywhere")}
            </Chip>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3">
        {result.error ? (
          <Notice>{t("dbNotReady")}</Notice>
        ) : result.rows.length === 0 ? (
          <Notice>{t("noResults")}</Notice>
        ) : (
          result.rows.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              kind={type === "offers" ? "offer" : "request"}
              t={t}
              showReport={type === "offers"}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Explore searchParams={searchParams} />
    </Suspense>
  );
}
