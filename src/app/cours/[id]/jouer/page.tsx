"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Player } from "@/components/Player";
import { useHydrated, useStore } from "@/lib/store";

export default function PlayPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const plan = useStore((s) => s.plans.find((p) => p.id === id));
  if (!hydrated) return null;
  if (!plan)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-display text-2xl">Cours introuvable</p>
        <Link href="/" className="btn-primary mt-4">
          Retour à mes cours
        </Link>
      </div>
    );
  return <Player key={plan.id} plan={plan} />;
}
