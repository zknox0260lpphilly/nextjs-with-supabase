"use client";

import { usePathname } from "next/navigation";
import { setLanguage } from "@/lib/ekip/actions";
import { LANGS, type Lang } from "@/lib/i18n/constants";
import { cn } from "@/lib/utils";

// Small language buttons for the header. Works without JavaScript.
export function LangSwitch({ current }: { current: Lang }) {
  const pathname = usePathname();
  return (
    <form action={setLanguage} className="flex items-center gap-1">
      <input type="hidden" name="next" value={pathname} />
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="submit"
          name="lang"
          value={lang}
          aria-label={lang}
          aria-current={lang === current ? "true" : undefined}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold uppercase transition-colors",
            lang === current
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          {lang}
        </button>
      ))}
    </form>
  );
}
