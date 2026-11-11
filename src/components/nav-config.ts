import type { Localized } from "@/lib/locale";

export const NAV_LINKS: { href: string; label: Localized<string> }[] = [
  { href: "/", label: { fr: "Mes cours", en: "My classes", es: "Mis clases" } },
  { href: "/postures", label: { fr: "Postures", en: "Poses", es: "Posturas" } },
];
