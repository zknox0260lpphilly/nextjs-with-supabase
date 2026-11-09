import Link from "next/link";
import { Suspense } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  Notice,
  SelectBox,
  TextInput,
} from "@/components/ekip/fields";
import { LocationFields } from "@/components/ekip/location-fields";
import {
  PageSkeleton,
  PageTitle,
  SignInPrompt,
} from "@/components/ekip/page-bits";
import { SignOutButton } from "@/components/ekip/sign-out-button";
import { updateProfile } from "@/lib/ekip/actions";
import { COUNTRIES } from "@/lib/ekip/geo";
import { getMyProfile, getUser, isTeamMember } from "@/lib/ekip/queries";
import {
  LANGS,
  LANG_NAMES,
  USER_TYPES,
  type UserType,
} from "@/lib/i18n/constants";
import { getLocation, getT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translations";

const USER_TYPE_KEY: Record<UserType, TranslationKey> = {
  student: "userStudent",
  teacher: "userTeacher",
  community_member: "userCommunity",
};

async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; e?: string }>;
}) {
  const [{ lang, t }, user, cookieLocation, { saved, e }] = await Promise.all([
    getT(),
    getUser(),
    getLocation(),
    searchParams,
  ]);

  if (!user) {
    return (
      <div className="grid gap-6">
        <PageTitle>{t("profileTitle")}</PageTitle>
        <SignInPrompt message={t("signInToMessage")} t={t} />
        <Link
          href="/welcome/language"
          className="text-center text-sm text-primary hover:underline"
        >
          {t("yourLanguage")}: {LANG_NAMES[lang].name}
        </Link>
      </div>
    );
  }

  const [profile, team] = await Promise.all([
    getMyProfile(user.id),
    isTeamMember(user.id),
  ]);
  if (!profile) {
    return (
      <div>
        <PageTitle>{t("profileTitle")}</PageTitle>
        <Notice>{t("dbNotReady")}</Notice>
      </div>
    );
  }

  const location = profile.country
    ? {
        country: profile.country,
        region: profile.department ?? "",
        city: profile.city ?? "",
      }
    : cookieLocation;

  return (
    <div className="grid gap-6">
      <PageTitle>{t("profileTitle")}</PageTitle>

      {saved ? <Notice tone="success">{t("saved")}</Notice> : null}
      {e ? <Notice tone="error">{t("errorGeneric")}</Notice> : null}

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>{user.email}</span>
        {profile.verified_at ? (
          <span className="inline-flex items-center gap-1 text-primary">
            <BadgeCheck className="size-4" aria-hidden />
            {t("verifiedBadge")}
          </span>
        ) : null}
      </div>

      <form action={updateProfile} className="grid gap-5">
        <Field
          label={t("displayName")}
          hint={t("displayNameHint")}
          htmlFor="display_name"
        >
          <TextInput
            id="display_name"
            name="display_name"
            maxLength={60}
            defaultValue={profile.display_name}
            autoComplete="given-name"
          />
        </Field>

        <Field label={t("iAm")} htmlFor="user_type">
          <SelectBox
            id="user_type"
            name="user_type"
            defaultValue={profile.user_type}
          >
            {USER_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(USER_TYPE_KEY[value])}
              </option>
            ))}
          </SelectBox>
        </Field>

        <Field label={t("orgName")} htmlFor="organization_name">
          <TextInput
            id="organization_name"
            name="organization_name"
            maxLength={100}
            defaultValue={profile.organization_name ?? ""}
          />
        </Field>

        <Field label={t("yourLanguage")} htmlFor="language">
          <SelectBox id="language" name="language" defaultValue={profile.language}>
            {LANGS.map((value) => (
              <option key={value} value={value}>
                {LANG_NAMES[value].name}
              </option>
            ))}
          </SelectBox>
        </Field>

        <LocationFields
          lang={lang}
          initial={location}
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

        <p className="text-xs text-muted-foreground">{t("profileVisible")}</p>

        <Button type="submit" size="lg" className="h-12 text-base">
          {t("save")}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <SignOutButton label={t("signOut")} />
        {team ? (
          <Button asChild variant="ghost">
            <Link href="/moderation">
              <ShieldCheck aria-hidden />
              {t("modTitle")}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; e?: string }>;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Profile searchParams={searchParams} />
    </Suspense>
  );
}
