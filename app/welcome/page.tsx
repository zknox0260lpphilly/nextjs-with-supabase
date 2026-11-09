import Link from "next/link";
import { LogoMark } from "@/components/ekip/logo";
import { Button } from "@/components/ui/button";

// Very first screen: the Ekip name, then "Connect" to start choosing a language.
export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-between px-6 py-12">
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <div className="rounded-3xl bg-card p-5 shadow-sm">
          <LogoMark className="size-24" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-navy dark:text-foreground">
          Ekip
        </h1>
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Connect · Collaborate · Grow
        </p>
      </div>

      <div className="grid w-full gap-4 text-center">
        <Button asChild size="lg" className="h-12 rounded-full text-base">
          <Link href="/welcome/language">Connect</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
