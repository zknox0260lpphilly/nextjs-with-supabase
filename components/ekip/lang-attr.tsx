"use client";

import { useEffect } from "react";

// Keeps <html lang> in step with the language the person chose.
export function LangAttr({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
