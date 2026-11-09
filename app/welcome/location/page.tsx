import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LangAttr } from "@/components/ekip/lang-attr";
import { Notice } from "@/components/ekip/fields";
import { LocationFields } from "@/components/ekip/location-fields";
import { setLocation } from "@/lib/ekip/actions";
import { COUNTRIES } from "@/lib/ekip/geo";
import { getLocation, getT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translations";

async function LocationStep({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const [{ lang, t }, initial, { e }] = await Promise.all([
    getT(),
    getLocation(),
    searchParams,
  ]);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <LangAttr lang={lang} />
      <Link
        href="/welcome/language"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("back")}
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("locTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("locSub")}</p>
      </div>

      {e ? <Notice tone="error">{t("errorGeneric")}</Notice> : null}

      <form action={setLocation} className="grid gap-6">
        <LocationFields
          lang={lang}
          initial={initial}
          labels={{
            country: t("country"),
            region: {
              HT: t("regionHT"),
              US: t("regionUS"),
              CA: t("regionCA"),
              other: t("regionOther"),
            },
            city: t("city"),
            select: t("select"),
            optional: t("optional"),
            countryNames: Object.fromEntries(
              COUNTRIES.map((c) => [c, t(`country_${c}` as TranslationKey)]),
            ),
          }}
        />
        <Button type="submit" size="lg" className="h-12 text-base">
          {t("continue")}
        </Button>
      </form>
    </main>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  return (
    <Suspense>
      <LocationStep searchParams={searchParams} />
    </Suspense>
  );
}
