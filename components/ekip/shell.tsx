import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getT } from "@/lib/i18n/server";
import { LangAttr } from "./lang-attr";
import { LangSwitch } from "./lang-switch";
import { LogoMark } from "./logo";
import { TabBar } from "./tab-bar";

// Header, page area and bottom tabs shared by every Ekip page.
export async function Shell({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getT();
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
