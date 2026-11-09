import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice, TextInput } from "@/components/ekip/fields";
import { PageSkeleton } from "@/components/ekip/page-bits";
import { PhotoUpload } from "@/components/ekip/photo-upload";
import { confirmReceipt, sendMessage } from "@/lib/ekip/actions";
import { getChat, getUser } from "@/lib/ekip/queries";
import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

async function Chat({
  params,
  searchParams,
}: {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const [{ lang, t }, user, { matchId }, { e }] = await Promise.all([
    getT(),
    getUser(),
    params,
    searchParams,
  ]);
  const { match, messages, photos, error } = await getChat(matchId);

  if (error) return <Notice>{t("dbNotReady")}</Notice>;
  if (!match || !user) return <Notice>{t("noResults")}</Notice>;

  const iAmRequester = match.requests.requester_id === user.id;
  const other = iAmRequester
    ? match.offers.profiles.display_name
    : match.requests.profiles.display_name;
  const delivered = Boolean(match.received_confirmed_at);
  const timeFormat = new Intl.DateTimeFormat(lang, {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("back")}
        </Link>
        <Link
          href={`/messages/${matchId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="size-4" aria-hidden />
          {t("refresh")}
        </Link>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{t("chatAbout")}</p>
        <h1 className="text-xl font-bold leading-snug">
          {match.requests.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {other || t("anonymous")}
        </p>
      </div>

      {e ? <Notice tone="error">{t("errorGeneric")}</Notice> : null}

      <ul className="grid gap-2" aria-label={t("messagesTitle")}>
        {messages.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <li
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                mine
                  ? "justify-self-end bg-primary text-primary-foreground"
                  : "justify-self-start bg-muted",
              )}
            >
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p
                className={cn(
                  "mt-1 text-[10px]",
                  mine ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {mine ? t("you") : other || t("anonymous")} ·{" "}
                {timeFormat.format(new Date(m.created_at))}
              </p>
            </li>
          );
        })}
      </ul>

      <form action={sendMessage} className="flex gap-2">
        <input type="hidden" name="match_id" value={matchId} />
        <TextInput
          name="body"
          required
          maxLength={2000}
          placeholder={t("typeMessage")}
          aria-label={t("typeMessage")}
          autoComplete="off"
        />
        <Button type="submit" className="h-11 px-5">
          {t("send")}
        </Button>
      </form>

      <section className="grid gap-3 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">{t("photos")}</h2>
        {photos.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((p) => (
              <li key={p.id}>
                {/* Signed Supabase URL, so a plain <img> is the right tool here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full rounded-lg object-cover"
                />
              </li>
            ))}
          </ul>
        ) : null}
        <PhotoUpload
          matchId={matchId}
          labels={{
            add: t("addPhoto"),
            help: t("photoHelp"),
            uploading: t("uploading"),
            error: t("errorGeneric"),
          }}
        />
      </section>

      {delivered ? (
        <p className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground">
          <CheckCircle2 className="size-5" aria-hidden />
          {t("receivedDone")}
        </p>
      ) : iAmRequester ? (
        <form action={confirmReceipt} className="grid gap-2 rounded-xl border bg-card p-4">
          <input type="hidden" name="match_id" value={matchId} />
          <p className="text-sm text-muted-foreground">{t("confirmHelp")}</p>
          <Button type="submit" size="lg" className="h-12 text-base">
            {t("confirmReceived")}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Chat params={params} searchParams={searchParams} />
    </Suspense>
  );
}
