import Link from "next/link";
import { Suspense } from "react";
import { HandHeart, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  Notice,
  SelectBox,
  TextArea,
  TextInput,
} from "@/components/ekip/fields";
import {
  PageSkeleton,
  PageTitle,
  SignInPrompt,
} from "@/components/ekip/page-bits";
import { createOffer, createRequest } from "@/lib/ekip/actions";
import { getUser } from "@/lib/ekip/queries";
import { CATEGORY_SLUGS } from "@/lib/i18n/constants";
import { getT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

type Params = { type?: string; e?: string };

async function Post({ searchParams }: { searchParams: Promise<Params> }) {
  const [{ t }, user, { type, e }] = await Promise.all([
    getT(),
    getUser(),
    searchParams,
  ]);

  if (!user) {
    return (
      <div>
        <PageTitle>{t("postTitle")}</PageTitle>
        <SignInPrompt message={t("signInToPost")} t={t} />
      </div>
    );
  }

  const kind = type === "offer" ? "offer" : type === "need" ? "need" : null;

  return (
    <div>
      <PageTitle>{t("postTitle")}</PageTitle>

      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ["need", "needHelp", HandHeart],
            ["offer", "offerHelp", HeartHandshake],
          ] as const
        ).map(([value, label, Icon]) => (
          <Link
            key={value}
            href={`/post?type=${value}`}
            aria-current={kind === value ? "true" : undefined}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-sm font-semibold transition-colors",
              kind === value
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:border-primary hover:bg-accent",
            )}
          >
            <Icon className="size-6" aria-hidden />
            {t(label)}
          </Link>
        ))}
      </div>

      {!kind ? (
        <p className="mt-6 text-center text-muted-foreground">
          {t("postChoose")}
        </p>
      ) : (
        <form
          action={kind === "need" ? createRequest : createOffer}
          className="mt-6 grid gap-5"
        >
          {e ? <Notice tone="error">{t("errorGeneric")}</Notice> : null}

          <Field label={t("fieldCategory")} htmlFor="category">
            <SelectBox id="category" name="category" required defaultValue="">
              <option value="" disabled>
                {t("select")}
              </option>
              {CATEGORY_SLUGS.map((slug) => (
                <option key={slug} value={slug}>
                  {t(`cat_${slug}` as TranslationKey)}
                </option>
              ))}
            </SelectBox>
          </Field>

          <Field
            label={t("fieldTitle")}
            hint={t("fieldTitleHint")}
            htmlFor="title"
          >
            <TextInput id="title" name="title" required maxLength={120} />
          </Field>

          <Field label={t("fieldQuantity")} htmlFor="quantity">
            <TextInput
              id="quantity"
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={1000}
              defaultValue={1}
              required
            />
          </Field>

          <Field label={t("fieldDescription")} htmlFor="description">
            <TextArea id="description" name="description" maxLength={1000} />
          </Field>

          <p className="text-xs text-muted-foreground">{t("safetyTip")}</p>

          <Button type="submit" size="lg" className="h-12 text-base">
            {kind === "need" ? t("submitRequest") : t("submitOffer")}
          </Button>
        </form>
      )}
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
      <Post searchParams={searchParams} />
    </Suspense>
  );
}
