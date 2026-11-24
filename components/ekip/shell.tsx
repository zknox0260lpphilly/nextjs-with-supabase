import Link from "next/link";
import { Bell } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  countUnreadNotifications,
  getUser,
  isTeamMember,
} from "@/lib/ekip/queries";
import { getT } from "@/lib/i18n/server";
import { LangAttr } from "./lang-attr";
import { LangSwitch } from "./lang-switch";
import { LogoMark } from "./logo";
import { TabBar } from "./tab-bar";

// Header, page area and bottom tabs shared by every Ekip page.
export async function Shell({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getT();
  // Ekip team members get a bell that shows new requests.
  const user = await getUser();
  const team = user ? await isTeamMember(user.id) : false;
  const unread = team ? await countUnreadNotifications() : 0;
  return (
    <div className="flex min-h-svh flex-col">
      <LangAttr lang={lang} />
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="size-8" />
            <span className="text-xl font-extrabold tracking-tight text-navy dark:text-foreground">
              Ekip
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Launchpad Student
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {team ? (
              <Link
                href="/notifications"
                aria-label={`${t("notificationsTitle")}${unread > 0 ? ` (${unread})` : ""}`}
                className="relative flex size-9 items-center justify-center rounded-md hover:bg-accent"
              >
                <Bell className="size-5" aria-hidden />
                {unread > 0 ? (
                  <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
            ) : null}
            <LangSwitch current={lang} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6">
        {children}
      </main>
      <TabBar
        labels={{
          home: t("tabHome"),
          explore: t("tabExplore"),
          post: t("tabPost"),
          messages: t("tabMessages"),
          profile: t("tabProfile"),
        }}
      />
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="h-14 border-b" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6">
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </main>
    </div>
  );
}
