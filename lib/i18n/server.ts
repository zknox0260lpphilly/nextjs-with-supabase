import { cookies } from "next/headers";
import { parseLocation, type Location } from "@/lib/ekip/geo";
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  LOC_COOKIE,
  isLang,
  type Lang,
} from "./constants";
import { getTranslator, type Translator } from "./translations";

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

export async function getLocation(): Promise<Location | null> {
  return parseLocation((await cookies()).get(LOC_COOKIE)?.value);
}

export async function getT(): Promise<{ lang: Lang; t: Translator }> {
  const lang = await getLang();
  return { lang, t: getTranslator(lang) };
}
