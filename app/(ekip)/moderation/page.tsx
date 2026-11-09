import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ekip/fields";
import { PageSkeleton, PageTitle } from "@/components/ekip/page-bits";
import { updateReportStatus } from "@/lib/ekip/actions";
import { getUser, isTeamMember, listOpenReports } from "@/lib/ekip/queries";
import { getT } from "@/lib/i18n/server";

// For the Ekip team only: reports of suspicious requests, offers and people.
async function Moderation() {
  const [{ lang, t }, user] = await Promise.all([getT(), getUser()]);
  const allowed = user ? await isTeamMember(user.id) : false;

  if (!allowed) {
    return (
      <div>
        <PageTitle>{t("modTitle")}</PageTitle>
        <Notice>{t("notTeam")}</Notice>
      </div>
    );
  }

  const reports = await listOpenReports();
  const timeFormat = new Intl.DateTimeFormat(lang, {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div>
      <PageTitle>{t("modTitle")}</PageTitle>
      {reports.length === 0 ? (
        <Notice>{t("noReports")}</Notice>
      ) : (
        <ul className="grid gap-3">
          {reports.map((r) => (
            <li key={r.id}>
              <Card className="grid gap-3 p-4">
                <p className="text-xs text-muted-foreground">
                  {timeFormat.format(new Date(r.created_at))} · {r.status}
                </p>
                <p className="whitespace-pre-wrap break-words text-sm">
                  {r.reason}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("reportedItem")}:{" "}
                  {r.reported_request_id ? (
                    <Link
                      href={`/requests/${r.reported_request_id}`}
                      className="text-primary hover:underline"
                    >
                      {r.reported_request_id}
                    </Link>
                  ) : (
                    (r.reported_offer_id ?? r.reported_profile_id)
                  )}
                </p>
                <form action={updateReportStatus} className="flex gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    name="status"
                    value="reviewing"
                    className="h-9 rounded-md border px-3 text-xs font-medium hover:bg-accent"
                  >
                    {t("markReviewing")}
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="closed"
                    className="h-9 rounded-md border px-3 text-xs font-medium hover:bg-accent"
                  >
                    {t("markClosed")}
                  </button>
                </form>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Moderation />
    </Suspense>
  );
}
