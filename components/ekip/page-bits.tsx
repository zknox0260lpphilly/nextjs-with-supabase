import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Translator } from "@/lib/i18n/translations";

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-5 text-2xl font-bold tracking-tight">{children}</h1>;
}

export function PageSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-28 animate-pulse rounded-xl bg-muted" />
      <div className="h-28 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

// Shown in place of a page that needs an account.
export function SignInPrompt({ message, t }: { message: string; t: Translator }) {
  return (
    <div className="grid gap-4 rounded-xl border bg-card p-6 text-center">
      <p>{message}</p>
      <div className="flex justify-center gap-2">
        <Button asChild>
          <Link href="/auth/login">{t("signIn")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/sign-up">{t("createAccount")}</Link>
        </Button>
      </div>
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-lg font-semibold">{children}</h2>
      {action}
    </div>
  );
}
