import Link from "next/link";
import { Suspense } from "react";
import { AccountButton } from "./AccountButton";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NavLinks } from "./NavLinks";
import { NAV_LINKS } from "./nav-config";

export function Nav() {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line/70 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-2 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
          <img src="/icon.svg" alt="" width={30} height={30} className="rounded-[9px] shadow-soft" />
          <span className="font-display text-xl font-semibold tracking-tight">
            Flow <span className="text-accent italic">Creator</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <Suspense
            fallback={NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted">
                {l.label.fr}
              </Link>
            ))}
          >
            <NavLinks />
          </Suspense>
        </div>
        <div className="flex items-center gap-1 sm:ml-auto">
          <LocaleSwitcher />
          <AccountButton />
        </div>
      </nav>
    </header>
  );
}
