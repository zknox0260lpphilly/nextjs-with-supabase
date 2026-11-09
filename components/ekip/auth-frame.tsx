import Link from "next/link";
import { LangAttr } from "./lang-attr";

// Centered layout for the sign-in, sign-up and password pages.
export function AuthFrame({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <LangAttr lang={lang} />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="text-center text-3xl font-bold tracking-tight text-primary"
        >
          Ekip
        </Link>
        {children}
      </div>
    </div>
  );
}
