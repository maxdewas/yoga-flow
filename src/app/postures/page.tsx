"use client";

import Link from "next/link";
import { PoseBrowser } from "@/components/PoseBrowser";
import { useMessages } from "@/lib/i18n";
import { useHydrated } from "@/lib/store";

const M = {
  fr: { title: "Postures", custom: "+ Posture personnalisée" },
  en: { title: "Poses", custom: "+ Custom pose" },
  es: { title: "Posturas", custom: "+ Postura personalizada" },
};

export default function PosesPage() {
  const t = useMessages(M);
  const hydrated = useHydrated();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <Link href="/postures/nouvelle" className="btn-primary">
          {t.custom}
        </Link>
      </div>
      {hydrated && <PoseBrowser />}
    </div>
  );
}
