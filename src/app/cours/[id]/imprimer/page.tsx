"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PoseThumb } from "@/components/PoseThumb";
import { formatDuration, formatHold, planSeconds, sectionSeconds } from "@/lib/duration";
import { useHydrated, usePoseMap, useStore } from "@/lib/store";
import { BREATH_LABELS, LEVEL_LABELS, SIDE_LABELS } from "@/lib/types";

export default function PrintPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const plan = useStore((s) => s.plans.find((p) => p.id === id));
  const poseMap = usePoseMap();
  const [withImages, setWithImages] = useState(true);
  const [withCues, setWithCues] = useState(true);

  if (!hydrated) return null;
  if (!plan) return <p>Cours introuvable.</p>;

  // Numbering runs continuously across sections.
  const offsets = plan.sections.map((_, i) =>
    plan.sections.slice(0, i).reduce((n, s) => n + s.items.length, 0),
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="no-print mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3 text-sm">
        <Link href={`/cours/${plan.id}`} className="btn">
          ← Retour à l&apos;éditeur
        </Link>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={withImages} onChange={(e) => setWithImages(e.target.checked)} /> Images
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={withCues} onChange={(e) => setWithCues(e.target.checked)} /> Consignes
        </label>
        <button className="btn-primary ml-auto" onClick={() => window.print()}>
          Imprimer / Enregistrer en PDF
        </button>
      </div>

      <header className="mb-5 border-b border-line pb-3">
        <h1 className="font-display text-3xl font-semibold">{plan.title}</h1>
        <p className="text-sm text-muted">
          {[plan.theme, LEVEL_LABELS[plan.level], `≈ ${formatDuration(planSeconds(plan))}`].filter(Boolean).join(" · ")}
        </p>
        {plan.intention && <p className="mt-2 italic">{plan.intention}</p>}
        {plan.notes && <p className="mt-2 whitespace-pre-line text-sm">{plan.notes}</p>}
      </header>

      {plan.sections.map((section, sectionIndex) => (
        <section key={section.id} className="mb-5 break-inside-avoid-page">
          <h2 className="mb-2 flex items-baseline justify-between border-b border-line text-lg font-semibold">
            {section.title}
            <span className="text-xs font-normal text-muted">{formatDuration(sectionSeconds(section))}</span>
          </h2>
          <ol className="space-y-2">
            {section.items.map((item, itemIndex) => {
              const pose = poseMap.get(item.poseId);
              return (
                <li key={item.id} className="flex break-inside-avoid items-start gap-3">
                  <span className="w-6 pt-1 text-right text-sm text-muted">{offsets[sectionIndex] + itemIndex + 1}.</span>
                  {withImages && pose && <PoseThumb pose={pose} size={48} />}
                  <div className="flex-1">
                    <p>
                      <strong>{pose?.nameFr ?? "Posture supprimée"}</strong>{" "}
                      <span className="text-sm italic text-muted">{pose?.sanskrit}</span>
                    </p>
                    <p className="text-sm text-muted">
                      {formatHold(item)}
                      {item.side !== "aucun" && ` · ${SIDE_LABELS[item.side]}`}
                      {item.breath && item.breath !== "aucun" && ` · ${BREATH_LABELS[item.breath]}`}
                    </p>
                    {withCues && item.cue && <p className="whitespace-pre-line text-sm">{item.cue}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
