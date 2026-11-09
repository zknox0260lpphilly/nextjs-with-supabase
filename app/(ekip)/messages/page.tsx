import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ekip/fields";
import {
  PageSkeleton,
  PageTitle,
  SignInPrompt,
} from "@/components/ekip/page-bits";
import { getUser, listMatches } from "@/lib/ekip/queries";
import { getT } from "@/lib/i18n/server";

async function Messages() {
  const [{ t }, user] = await Promise.all([getT(), getUser()]);

  if (!user) {
    return (
      <div>
        <PageTitle>{t("messagesTitle")}</PageTitle>
        <SignInPrompt message={t("signInToMessage")} t={t} />
      </div>
    );
  }

  const { rows, error } = await listMatches();

  return (
    <div>
      <PageTitle>{t("messagesTitle")}</PageTitle>
      {error ? (
        <Notice>{t("dbNotReady")}</Notice>
      ) : rows.length === 0 ? (
        <Notice>{t("noConversations")}</Notice>
      ) : (
        <ul className="grid gap-3">
          {rows.map((m) => {
            const other =
              m.requests.requester_id === user.id
                ? m.offers.profiles.display_name
                : m.requests.profiles.display_name;
            return (
              <li key={m.id}>
                <Link href={`/messages/${m.id}`}>
                  <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {m.requests.title}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {other || t("anonymous")}
                      </p>
                    </div>
                    {m.received_confirmed_at ? (
                      <CheckCircle2
                        className="size-5 shrink-0 text-primary"
                        aria-label={t("receivedDone")}
                      />
                    ) : null}
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Messages />
    </Suspense>
  );
}
