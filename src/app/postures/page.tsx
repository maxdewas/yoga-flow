"use client";

import Link from "next/link";
import { PoseBrowser } from "@/components/PoseBrowser";
import { useHydrated } from "@/lib/store";

export default function PosesPage() {
  const hydrated = useHydrated();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Postures</h1>
        <Link href="/postures/nouvelle" className="btn-primary">
          + Posture personnalisée
        </Link>
      </div>
      {hydrated && <PoseBrowser />}
    </div>
  );
}
