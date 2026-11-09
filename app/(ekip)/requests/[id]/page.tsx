import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Notice, TextArea } from "@/components/ekip/fields";
import { PageSkeleton } from "@/components/ekip/page-bits";
import { PostCard } from "@/components/ekip/post-card";
import { ReportForm } from "@/components/ekip/report-form";
import { offerHelp } from "@/lib/ekip/actions";
import { getRequest, getUser } from "@/lib/ekip/queries";
import { getT } from "@/lib/i18n/server";

type Params = { reported?: string; e?: string };

async function RequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Params>;
}) {
  const [{ t }, user, { id }, { reported, e }] = await Promise.all([
    getT(),
    getUser(),
    params,
    searchParams,
  ]);
  const { row, error } = await getRequest(id);

  return (
    <div className="grid gap-5">
      <Link
        href="/explore"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("back")}
      </Link>

      {error ? (
        <Notice>{t("dbNotReady")}</Notice>
      ) : !row ? (
        <Notice>{t("noResults")}</Notice>
      ) : (
        <>
          {reported ? <Notice tone="success">{t("reportThanks")}</Notice> : null}
          {e ? <Notice tone="error">{t("errorGeneric")}</Notice> : null}

          <PostCard post={row} kind="request" t={t} className="[&_h3]:text-xl" />

          {row.status !== "submitted" ? (
            <Notice>{t("alreadyMatched")}</Notice>
          ) : !user ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm">{t("signInToHelp")}</p>
              <Button asChild size="sm">
                <Link href="/auth/login">{t("signIn")}</Link>
              </Button>
            </div>
          ) : user.id === row.requester_id ? (
            <Notice>{t("ownRequest")}</Notice>
          ) : (
            <form
              action={offerHelp}
              className="grid gap-4 rounded-xl border bg-card p-4"
            >
              <input type="hidden" name="request_id" value={row.id} />
              <Field
                label={t("helpNoteLabel")}
                hint={t("helpNoteHint")}
                htmlFor="note"
              >
                <TextArea id="note" name="note" maxLength={2000} />
              </Field>
              <Button type="submit" size="lg" className="h-12 text-base">
                {t("helpButton")}
              </Button>
            </form>
          )}

          <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t("safetyTip")}
          </p>

          {user ? (
            <ReportForm kind="request" id={row.id} back={`/requests/${row.id}`} t={t} />
          ) : null}
        </>
      )}
    </div>
  );
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Params>;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequestPage params={params} searchParams={searchParams} />
    </Suspense>
  );
}
