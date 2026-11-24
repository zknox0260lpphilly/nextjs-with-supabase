import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ekip/fields";
import { PageSkeleton } from "@/components/ekip/page-bits";
import { placeLabel } from "@/components/ekip/post-card";
import { markNotificationsRead } from "@/lib/ekip/actions";
import { listNotifications } from "@/lib/ekip/queries";
import { getT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const USER_TYPE_KEY: Record<string, TranslationKey> = {
  student: "userStudent",
  teacher: "userTeacher",
  community_member: "userCommunity",
};

// The Ekip team sees every new request here, newest first, so they can
// answer teachers quickly.
async function Notifications() {
  const { lang, t } = await getT();
  const { rows, error } = await listNotifications();
  const unread = rows.filter((n) => !n.read_at).length;
  const timeFormat = new Intl.DateTimeFormat(lang, {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("notificationsTitle")}
        </h1>
        {unread > 0 ? (
          <form action={markNotificationsRead}>
            <Button type="submit" variant="outline" size="sm">
              {t("markAllRead")}
            </Button>
          </form>
        ) : null}
      </div>

      {error ? (
        <Notice>{t("dbNotReady")}</Notice>
      ) : rows.length === 0 ? (
        <Notice>{t("noNotifications")}</Notice>
      ) : (
        <ul className="grid gap-3">
          {rows.map((n) => {
            const request = n.requests;
            if (!request) return null;
            const poster = request.profiles;
            const place = placeLabel(poster, t);
            return (
              <li key={n.id}>
                <Link href={`/requests/${request.id}`}>
                  <Card
                    className={cn(
                      "p-4 transition-colors hover:bg-accent",
                      !n.read_at && "border-primary",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          "font-semibold",
                          !n.read_at && "text-primary",
                        )}
                      >
                        {t("newRequestBadge")}
                      </span>
                      <time dateTime={n.created_at}>
                        {timeFormat.format(new Date(n.created_at))}
                      </time>
                    </div>
                    <p className="mt-1 font-semibold">{request.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(`cat_${request.categories.slug}` as TranslationKey)} ·{" "}
                      {t("quantity")}: {request.quantity}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {poster.display_name || t("anonymous")} ·{" "}
                      {t(USER_TYPE_KEY[poster.user_type] ?? "userCommunity")}
                      {place ? ` · ${place}` : ""}
                    </p>
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
      <Notifications />
    </Suspense>
  );
}
