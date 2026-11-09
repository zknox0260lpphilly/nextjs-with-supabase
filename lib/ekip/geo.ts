import type { Lang } from "@/lib/i18n/constants";

// Country codes shown in the location step. "XX" means another country.
export const COUNTRIES = ["HT", "US", "CA", "FR", "DO", "BR", "CL", "XX"] as const;
export type CountryCode = (typeof COUNTRIES)[number];

export function isCountry(value: unknown): value is CountryCode {
  return (
    typeof value === "string" && (COUNTRIES as readonly string[]).includes(value)
  );
}

// Haiti's 10 departments. The stored value is the French name; Creole shows its own spelling.
export const HAITI_DEPARTMENTS: { value: string; ht: string }[] = [
  { value: "Ouest", ht: "Lwès" },
  { value: "Artibonite", ht: "Latibonit" },
  { value: "Nord", ht: "Nò" },
  { value: "Nord-Est", ht: "Nòdès" },
  { value: "Nord-Ouest", ht: "Nòdwès" },
  { value: "Centre", ht: "Sant" },
  { value: "Sud", ht: "Sid" },
  { value: "Sud-Est", ht: "Sidès" },
  { value: "Grand'Anse", ht: "Grandans" },
  { value: "Nippes", ht: "Nip" },
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
  "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
];

const CA_PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Nova Scotia", "Ontario",
  "Prince Edward Island", "Quebec", "Saskatchewan", "Northwest Territories",
  "Nunavut", "Yukon",
];

export type RegionOption = { value: string; label: string };

// Countries with a fixed list of regions return options; others use a free text box.
export function regionOptions(
  country: string,
  lang: Lang,
): RegionOption[] | null {
  if (country === "HT") {
    return HAITI_DEPARTMENTS.map((d) => ({
      value: d.value,
      label: lang === "ht" ? d.ht : d.value,
    }));
  }
  if (country === "US") return US_STATES.map((s) => ({ value: s, label: s }));
  if (country === "CA") return CA_PROVINCES.map((p) => ({ value: p, label: p }));
  return null;
}

export type Location = {
  country: string;
  region: string;
  city: string;
};

export function parseLocation(raw: string | undefined): Location | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<Location>;
    if (!isCountry(data.country)) return null;
    return {
      country: data.country,
      region: typeof data.region === "string" ? data.region : "",
      city: typeof data.city === "string" ? data.city : "",
    };
  } catch {
    return null;
  }
}
