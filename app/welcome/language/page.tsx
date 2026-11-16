import { BridgeMark } from "@/components/ekip/logo";
import { Button } from "@/components/ui/button";
import { setLanguage } from "@/lib/ekip/actions";
import { LANGS, LANG_NAMES } from "@/lib/i18n/constants";

// Step 1 of 2. The words on this screen are in Haitian Creole on purpose:
// the visitor has not chosen a language yet, and each option is shown as a
// greeting in its own language so people can recognize theirs.
export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 py-6">
      <p className="flex items-center gap-2 text-lg font-bold text-navy dark:text-foreground">
        <BridgeMark />
        Ekip
      </p>

      <form action={setLanguage} className="mt-10 flex flex-1 flex-col">
        <p className="text-xs font-medium text-primary">Etap 1 sou 2</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy dark:text-foreground">
          Ki lang ou pale?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ou ka chanje l nenpòt ki lè.
        </p>

        <fieldset className="mt-8 grid grid-cols-2 gap-3">
          <legend className="sr-only">Ki lang ou pale?</legend>
          {LANGS.map((lang) => (
            <label key={lang} lang={lang} className="cursor-pointer">
              <input
                type="radio"
                name="lang"
                value={lang}
                defaultChecked={lang === "ht"}
                className="peer sr-only"
              />
              <span className="block rounded-xl border-2 border-transparent bg-card px-4 py-4 shadow-sm transition-colors hover:border-border peer-checked:border-navy peer-focus-visible:ring-2 peer-focus-visible:ring-ring dark:peer-checked:border-primary">
                <span className="block text-lg font-bold text-navy dark:text-foreground">
                  {LANG_NAMES[lang].greeting}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {LANG_NAMES[lang].name}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="mt-auto pt-10">
          <Button type="submit" size="lg" className="h-12 w-full rounded-full text-base">
            Kontinye
          </Button>
        </div>
      </form>
    </main>
  );
}
