import Link from "next/link";
import type { Lang } from "@/lib/i18n/constants";
import { LangAttr } from "./lang-attr";
import { LangSwitch } from "./lang-switch";

// Centered layout for the sign-in, sign-up and password pages.
export function AuthFrame({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <LangAttr lang={lang} />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <LangSwitch current={lang} />
        </div>
        <Link
          href="/"
          className="text-center text-3xl font-extrabold tracking-tight text-navy dark:text-foreground"
        >
          Ekip
        </Link>
        {children}
      </div>
    </div>
  );
}
