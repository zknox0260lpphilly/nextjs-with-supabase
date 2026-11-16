"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import { COUNTRIES, COUNTRY_FLAGS } from "@/lib/ekip/geo";
import { cn } from "@/lib/utils";

// Search box and grid of country cards. Submits a field named "country".
export function CountryPicker({
  initial,
  names,
  labels,
}: {
  initial: string;
  names: Record<string, string>;
  labels: { search: string; none: string };
}) {
  const [selected, setSelected] = useState(initial || "HT");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = COUNTRIES.filter(
    (code) => !q || names[code].toLowerCase().includes(q),
  );

  return (
    <div className="grid gap-4">
      <input type="hidden" name="country" value={selected} />

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.search}
          aria-label={labels.search}
          className="h-11 w-full rounded-xl border bg-card pl-9 pr-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {shown.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {labels.none}
        </p>
      ) : (
        <div role="radiogroup" className="grid grid-cols-2 gap-3">
          {shown.map((code) => {
            const active = code === selected;
            return (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(code)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border-2 bg-card px-3 py-3 text-left text-sm font-medium text-navy shadow-sm transition-colors dark:text-foreground",
                  active
                    ? "border-navy dark:border-primary"
                    : "border-transparent hover:border-border",
                )}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {COUNTRY_FLAGS[code]}
                </span>
                <span className="min-w-0 flex-1 break-words leading-tight">{names[code]}</span>
                {active ? (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-navy text-white dark:bg-primary">
                    <Check className="size-3" aria-hidden />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
