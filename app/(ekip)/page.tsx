import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BookOpen,
  HandHeart,
  HeartHandshake,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  PageSkeleton,
  SectionTitle,
} from "@/components/ekip/page-bits";
import { PostCard } from "@/components/ekip/post-card";
import { Notice } from "@/components/ekip/fields";
import { CATEGORY_SLUGS } from "@/lib/i18n/constants";
import { getLocation, getT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translations";
import { listRequests, listResources } from "@/lib/ekip/queries";

async function Home() {
  const { lang, t } = await getT();
  const location = await getLocation();
  const area = location
    ? { country: location.country, region: location.region || undefined }
    : undefined;

  const [requests, resources] = await Promise.all([
    listRequests({ area, limit: 3 }),
    listResources(lang),
  ]);

  const place = location
    ? [
        location.city,
        location.region,
        t(`country_${location.country}` as TranslationKey),
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="grid gap-10">
      <section className="rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
        {place ? (
          <Link
            href="/welcome/location"
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs hover:bg-primary-foreground/25"
          >
            <MapPin className="size-3.5" aria-hidden />
            {place}
            <span className="underline">{t("change")}</span>
          </Link>
        ) : null}
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-3 max-w-xl text-primary-foreground/85">
          {t("heroSub")}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/post?type=need"
            className="group rounded-xl bg-background p-4 text-foreground shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HandHeart className="size-6 text-primary" aria-hidden />
            <span className="mt-2 flex items-center justify-between text-lg font-semibold">
              {t("needHelp")}
              <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
            </span>
            <span className="text-sm text-muted-foreground">
              {t("needHelpSub")}
            </span>
          </Link>
          <Link
            href="/post?type=offer"
            className="group rounded-xl bg-background p-4 text-foreground shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HeartHandshake className="size-6 text-secondary-foreground" aria-hidden />
            <span className="mt-2 flex items-center justify-between text-lg font-semibold">
              {t("offerHelp")}
              <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
            </span>
            <span className="text-sm text-muted-foreground">
              {t("offerHelpSub")}
            </span>
          </Link>
        </div>
      </section>

      <section>
        <SectionTitle>{t("categoriesTitle")}</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_SLUGS.map((slug) => (
            <Link
              key={slug}
              href={`/explore?cat=${slug}`}
              className="rounded-full border bg-card px-4 py-2 text-sm font-medium hover:border-primary hover:bg-accent"
            >
              {t(`cat_${slug}` as TranslationKey)}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          action={
            <Link
              href="/explore"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("seeAll")}
            </Link>
          }
        >
          {t("nearYou")}
        </SectionTitle>
        {requests.error ? (
          <Notice>{t("dbNotReady")}</Notice>
        ) : requests.rows.length === 0 ? (
          <Notice>{t("noPostsYet")}</Notice>
        ) : (
          <div className="grid gap-3">
            {requests.rows.map((post) => (
              <PostCard key={post.id} post={post} kind="request" t={t} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle>{t("howTitle")}</SectionTitle>
        <ol className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["how1T", "how1D"],
              ["how2T", "how2D"],
              ["how3T", "how3D"],
            ] as const
          ).map(([title, body], i) => (
            <li key={title}>
              <Card className="h-full p-4">
                <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{t(title)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(body)}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitle>{t("resourcesTitle")}</SectionTitle>
        {resources.length === 0 ? (
          <Notice>{t("noResources")}</Notice>
        ) : (
          <ul className="grid gap-3">
            {resources.map((r) => (
              <li key={r.id}>
                <Card className="flex items-start gap-3 p-4">
                  <BookOpen className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{r.title}</h3>
                    {r.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {r.description}
                      </p>
                    ) : null}
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                      >
                        {t("openResource")}
                      </a>
                    ) : null}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Home />
    </Suspense>
  );
}
