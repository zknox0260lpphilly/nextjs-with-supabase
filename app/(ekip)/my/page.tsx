import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ekip/fields";
import {
  PageSkeleton,
  PageTitle,
  SectionTitle,
  SignInPrompt,
} from "@/components/ekip/page-bits";
import { getUser, listMyPosts, type MyPost } from "@/lib/ekip/queries";
import { getT } from "@/lib/i18n/server";
import type { Translator, TranslationKey } from "@/lib/i18n/translations";

const STATUS_KEY: Record<string, TranslationKey> = {
  submitted: "statusSubmitted",
  matched: "statusMatched",
  delivered: "statusDelivered",
  available: "statusAvailable",
};

// Where a post leads: the chat once someone is helping, otherwise the request.
function PostRow({
  post,
  kind,
  t,
}: {
  post: MyPost;
  kind: "request" | "offer";
  t: Translator;
}) {
  const href = post.matchId
    ? `/messages/${post.matchId}`
    : kind === "request"
      ? `/requests/${post.id}`
      : null;
  const body = (
    <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{post.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(`cat_${post.categories.slug}` as TranslationKey)} ·{" "}
          {t("quantity")}: {post.quantity}
        </p>
        {post.matchId ? (
          <p className="mt-1 text-xs font-medium text-primary">
            {t("openChat")}
          </p>
        ) : null}
      </div>
      <Badge variant="secondary" className="shrink-0">
        {t(STATUS_KEY[post.status] ?? "statusSubmitted")}
      </Badge>
      {href ? (
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

// Everything the signed-in person posted, with its status:
// submitted, matched or delivered.
async function MyPosts() {
  const [{ t }, user] = await Promise.all([getT(), getUser()]);

  if (!user) {
    return (
      <div>
        <PageTitle>{t("myPostsTitle")}</PageTitle>
        <SignInPrompt message={t("signInToPost")} t={t} />
      </div>
    );
  }

  const { requests, offers, error } = await listMyPosts(user.id);

  return (
    <div className="grid gap-8">
      <PageTitle>{t("myPostsTitle")}</PageTitle>
      {error ? (
        <Notice>{t("dbNotReady")}</Notice>
      ) : (
        <>
          <section>
            <SectionTitle>{t("myRequests")}</SectionTitle>
            {requests.length === 0 ? (
              <Notice>{t("noMyRequests")}</Notice>
            ) : (
              <ul className="grid gap-3">
                {requests.map((p) => (
                  <li key={p.id} className="min-w-0">
                    <PostRow post={p} kind="request" t={t} />
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <SectionTitle>{t("myOffers")}</SectionTitle>
            {offers.length === 0 ? (
              <Notice>{t("noMyOffers")}</Notice>
            ) : (
              <ul className="grid gap-3">
                {offers.map((p) => (
                  <li key={p.id} className="min-w-0">
                    <PostRow post={p} kind="offer" t={t} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MyPosts />
    </Suspense>
  );
}
