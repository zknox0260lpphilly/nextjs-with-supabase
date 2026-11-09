export const LANGS = ["ht", "fr", "es", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "ht";

export const LANG_COOKIE = "ekip_lang";
export const LOC_COOKIE = "ekip_loc";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

// Each language is shown to people in its own words, so they can recognize it
// before they can read anything else.
export const LANG_NAMES: Record<Lang, { greeting: string; name: string }> = {
  ht: { greeting: "Bonjou", name: "Kreyòl Ayisyen" },
  fr: { greeting: "Bonjour", name: "Français" },
  es: { greeting: "Hola", name: "Español" },
  en: { greeting: "Hello", name: "English" },
};

export const CATEGORY_SLUGS = [
  "computers",
  "chromebooks",
  "books",
  "school_supplies",
  "information",
  "volunteer_support",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export function isCategory(value: unknown): value is CategorySlug {
  return (
    typeof value === "string" &&
    (CATEGORY_SLUGS as readonly string[]).includes(value)
  );
}

export const USER_TYPES = ["student", "teacher", "community_member"] as const;
export type UserType = (typeof USER_TYPES)[number];

export function isUserType(value: unknown): value is UserType {
  return (
    typeof value === "string" && (USER_TYPES as readonly string[]).includes(value)
  );
}
