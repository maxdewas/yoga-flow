/** Interface and catalogue languages. French is the source language of the hand-written catalogue. */
export type Locale = "fr" | "en" | "es";
export const LOCALES: Locale[] = ["fr", "en", "es"];
export const LOCALE_NAMES: Record<Locale, string> = { fr: "Français", en: "English", es: "Español" };

/** A value written once per language. */
export type Localized<T> = Record<Locale, T>;

/** First supported language of the browser, else French. */
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "fr";
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.slice(0, 2).toLowerCase();
    if ((LOCALES as string[]).includes(base)) return base as Locale;
  }
  return "fr";
}

/** Fills `{name}` placeholders. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}
