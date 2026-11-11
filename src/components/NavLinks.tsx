"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { NAV_LINKS } from "./nav-config";

export function NavLinks() {
  const pathname = usePathname();
  const locale = useLocale();
  return NAV_LINKS.map((l) => {
    const active = l.href === "/" ? pathname === "/" || pathname.startsWith("/cours") : pathname.startsWith(l.href);
    return (
      <Link
        key={l.href}
        href={l.href}
        aria-current={active ? "page" : undefined}
        className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
          active ? "bg-surface text-foreground shadow-soft" : "text-muted hover:text-foreground"
        }`}
      >
        {l.label[locale]}
      </Link>
    );
  });
}
