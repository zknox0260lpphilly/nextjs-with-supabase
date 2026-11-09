"use client";

import { useState } from "react";
import { COUNTRIES, regionOptions, type Location } from "@/lib/ekip/geo";
import type { Lang } from "@/lib/i18n/constants";
import { Field, SelectBox, TextInput } from "./fields";

export type LocationLabels = {
  country: string;
  region: Record<"HT" | "US" | "CA" | "other", string>;
  city: string;
  select: string;
  optional: string;
  countryNames: Record<string, string>;
};

// Country, then region (department, state or province), then city.
// Put this inside a <form>: it submits fields named country, region and city.
export function LocationFields({
  lang,
  labels,
  initial,
}: {
  lang: Lang;
  labels: LocationLabels;
  initial?: Location | null;
}) {
  const [country, setCountry] = useState(initial?.country ?? "");
  const options = country ? regionOptions(country, lang) : null;
  const regionLabel =
    country === "HT" || country === "US" || country === "CA"
      ? labels.region[country]
      : labels.region.other;

  return (
    <div className="grid gap-4">
      <Field label={labels.country} htmlFor="country">
        <SelectBox
          id="country"
          name="country"
          required
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="" disabled>
            {labels.select}
          </option>
          {COUNTRIES.map((code) => (
            <option key={code} value={code}>
              {labels.countryNames[code]}
            </option>
          ))}
        </SelectBox>
      </Field>

      {country ? (
        <Field
          label={`${regionLabel} (${labels.optional})`}
          htmlFor="region"
        >
          {options ? (
            <SelectBox
              key={country}
              id="region"
              name="region"
              defaultValue={
                initial?.country === country ? initial.region : ""
              }
            >
              <option value="">{labels.select}</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectBox>
          ) : (
            <TextInput
              key={country}
              id="region"
              name="region"
              maxLength={80}
              defaultValue={initial?.country === country ? initial.region : ""}
            />
          )}
        </Field>
      ) : null}

      {country ? (
        <Field label={`${labels.city} (${labels.optional})`} htmlFor="city">
          <TextInput
            id="city"
            name="city"
            maxLength={80}
            defaultValue={initial?.city ?? ""}
            autoComplete="address-level2"
          />
        </Field>
      ) : null}
    </div>
  );
}
