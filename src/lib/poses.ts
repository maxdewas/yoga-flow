import type { Locale } from "./locale";
import { buildCatalog, EMPTY_CONTENT, type LocaleContent } from "./catalog/localize";

export { buildCatalog };

/**
 * Per-language catalogue texts are loaded on demand (one chunk per language), so a visitor only
 * downloads the language they read. Until a language is loaded, the catalogue is built without its
 * texts (names fall back to French or English, generated texts still render).
 */
const loaders: Record<Locale, () => Promise<{ default: unknown }>> = {
  fr: () => import("./catalog/locales/fr.json"),
  en: () => import("./catalog/locales/en.json"),
  es: () => import("./catalog/locales/es.json"),
};
const loaded = new Map<Locale, LocaleContent>();
const pending = new Map<Locale, Promise<LocaleContent>>();

export function loadedContent(locale: Locale): LocaleContent {
  return loaded.get(locale) ?? EMPTY_CONTENT;
}

export function loadContent(locale: Locale): Promise<LocaleContent> {
  const done = loaded.get(locale);
  if (done) return Promise.resolve(done);
  let p = pending.get(locale);
  if (!p) {
    p = loaders[locale]().then((m) => {
      const content = m.default as LocaleContent;
      loaded.set(locale, content);
      return content;
    });
    pending.set(locale, p);
  }
  return p;
}
