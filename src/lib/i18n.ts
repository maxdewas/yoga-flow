"use client";

import { useEffect } from "react";
import { LABELS, type Labels } from "./labels";
import { detectLocale, type Locale, type Localized } from "./locale";
import { useStore } from "./store";

export * from "./locale";

/** Active language: the teacher's choice on this device, else the browser's. */
export function useLocale(): Locale {
  const chosen = useStore((s) => s.prefs.locale);
  return chosen ?? detectLocale();
}

/** Picks the messages of the active language from a colocated dictionary. */
export function useMessages<T>(messages: Localized<T>): T {
  return messages[useLocale()];
}

/** Labels of coded values (levels, categories, sides…) in the active language. */
export function useLabels(): Labels {
  return LABELS[useLocale()];
}

/** Keeps <html lang> in step with the chosen language. */
export function HtmlLang() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
