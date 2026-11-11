"use client";

import { Languages } from "lucide-react";
import { LOCALE_NAMES, LOCALES, useLocale, type Locale } from "@/lib/i18n";
import { useHydrated, useStore } from "@/lib/store";

/** Language of the interface and of the pose catalogue, remembered on this device. */
export function LocaleSwitcher() {
  const hydrated = useHydrated();
  const locale = useLocale();
  const setPrefs = useStore((s) => s.setPrefs);
  if (!hydrated) return <span className="h-8 w-14" aria-hidden />;
  return (
    <label className="relative flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-muted hover:text-foreground">
      <Languages size={15} aria-hidden />
      <span className="sr-only">Langue · Language · Idioma</span>
      <select
        className="cursor-pointer appearance-none bg-transparent pr-1 uppercase outline-none"
        value={locale}
        onChange={(e) => setPrefs({ locale: e.target.value as Locale })}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()} · {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
