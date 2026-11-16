import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LangAttr } from "@/components/ekip/lang-attr";
import { CountryPicker } from "@/components/ekip/country-picker";
import { Notice } from "@/components/ekip/fields";
import { setLocation } from "@/lib/ekip/actions";
import { COUNTRIES } from "@/lib/ekip/geo";
import { getLocation, getT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translations";

// Step 2 of 2: only the country. City and region can be added later on the
// Profile page, and are optional.
async function CountryStep({
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
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 py-6">
      <LangAttr lang={lang} />
      <Link
        href="/welcome/language"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("back")}
      </Link>

      <form action={setLocation} className="mt-6 flex flex-1 flex-col">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-navy dark:text-foreground">
            {t("countryTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("countrySub")}
          </p>
        </div>

        {e ? (
          <div className="mt-4">
            <Notice tone="error">{t("errorGeneric")}</Notice>
          </div>
        ) : null}

        <div className="mt-6">
          <CountryPicker
            initial={initial?.country ?? "HT"}
            labels={{ search: t("countrySearch"), none: t("noCountryFound") }}
            names={Object.fromEntries(
              COUNTRIES.map((c) => [c, t(`country_${c}` as TranslationKey)]),
            )}
          />
        </div>

        <div className="mt-auto pt-8">
          <Button type="submit" size="lg" className="h-12 w-full rounded-full text-base">
            {t("continue")}
          </Button>
        </div>
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
      <CountryStep searchParams={searchParams} />
    </Suspense>
  );
}
