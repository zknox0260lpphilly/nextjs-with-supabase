import { setLanguage } from "@/lib/ekip/actions";
import { LANGS, LANG_NAMES } from "@/lib/i18n/constants";

// First screen. The question is asked in all four languages at once, and each
// option is shown as a greeting in its own language.
export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-8 px-5 py-10">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary">Ekip</h1>
        <div className="mt-6 space-y-1 text-sm text-muted-foreground">
          <p>Chwazi lang ou</p>
          <p>Choisissez votre langue</p>
          <p>Elige tu idioma</p>
          <p>Choose your language</p>
        </div>
      </div>

      <form action={setLanguage} className="grid gap-3">
        {LANGS.map((lang) => (
          <button
            key={lang}
            type="submit"
            name="lang"
            value={lang}
            lang={lang}
            className="rounded-xl border bg-card px-5 py-4 text-left shadow-sm transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block text-xl font-semibold">
              {LANG_NAMES[lang].greeting}
            </span>
            <span className="block text-sm text-muted-foreground">
              {LANG_NAMES[lang].name}
            </span>
          </button>
        ))}
      </form>
    </main>
  );
}
