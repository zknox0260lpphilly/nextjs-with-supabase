import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Translator, TranslationKey } from "@/lib/i18n/translations";
import type { PostRow } from "@/lib/ekip/queries";
import { ReportForm } from "./report-form";

const USER_TYPE_KEY: Record<string, TranslationKey> = {
  student: "userStudent",
  teacher: "userTeacher",
  community_member: "userCommunity",
};

const STATUS_KEY: Record<string, TranslationKey> = {
  submitted: "statusSubmitted",
  matched: "statusMatched",
  delivered: "statusDelivered",
  available: "statusAvailable",
};

export function placeLabel(
  poster: PostRow["profiles"],
  t: Translator,
): string {
  const country = poster.country
    ? t(`country_${poster.country}` as TranslationKey)
    : "";
  return [poster.city, poster.department, country]
    .filter(Boolean)
    .join(", ");
}

// One request or offer in a list. Requests link to their own page.
export function PostCard({
  post,
  kind,
  t,
  showReport = false,
  className,
}: {
  post: PostRow;
  kind: "request" | "offer";
  t: Translator;
  showReport?: boolean;
  className?: string;
}) {
  const poster = post.profiles;
  const place = placeLabel(poster, t);
  const title = (
    <h3 className="text-base font-semibold leading-snug">{post.title}</h3>
  );

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        {kind === "request" ? (
          <Link href={`/requests/${post.id}`} className="hover:underline">
            {title}
          </Link>
        ) : (
          title
        )}
        <Badge variant="secondary" className="shrink-0">
          {t(STATUS_KEY[post.status] ?? "statusSubmitted")}
        </Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <Badge variant="outline">
          {t(`cat_${post.categories.slug}` as TranslationKey)}
        </Badge>
        <Badge variant="outline">
          {t("quantity")}: {post.quantity}
        </Badge>
      </div>

      {post.description ? (
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
          {post.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          {poster.display_name || t("anonymous")}
          {poster.verified_at ? (
            <BadgeCheck
              className="size-3.5 text-primary"
              aria-label={t("verifiedBadge")}
            />
          ) : null}
          <span aria-hidden>·</span>
          {t(USER_TYPE_KEY[poster.user_type] ?? "userCommunity")}
        </span>
        {place ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {place}
          </span>
        ) : null}
      </div>

      {showReport ? (
        <div className="mt-3">
          <ReportForm kind={kind} id={post.id} back="/explore" t={t} />
        </div>
      ) : null}
    </Card>
  );
}
