"use client";

import { useEffect, useRef } from "react";
import { formatDuration } from "@/lib/duration";
import { format, useMessages } from "@/lib/i18n";
import type { Pose, Section } from "@/lib/types";
import { PoseThumb } from "./PoseThumb";

const M = {
  fr: { myFlow: "Mon flow", poses: "{n} posture(s)", addingTo: "ajout dans « {title} »", view: "Voir le cours", empty: "Touche une posture pour l'ajouter au cours.", deleted: "Posture supprimée" },
  en: { myFlow: "My flow", poses: "{n} pose(s)", addingTo: "adding to “{title}”", view: "View class", empty: "Tap a pose to add it to the class.", deleted: "Deleted pose" },
  es: { myFlow: "Mi flow", poses: "{n} postura(s)", addingTo: "añadiendo a «{title}»", view: "Ver la clase", empty: "Toca una postura para añadirla a la clase.", deleted: "Postura eliminada" },
};

const plural = (template: string, n: number) => format(template.replace(/\((\w+)\)/g, n > 1 ? "$1" : ""), { n });

/**
 * The class being built, kept in view at the bottom of the full-screen pose picker (phones, tablets in portrait),
 * where the editor itself is hidden. Scrolls to the end of the section receiving new poses.
 */
export function FlowStrip({
  sections,
  targetId,
  poseMap,
  totalSeconds,
  onDone,
}: {
  sections: Section[];
  /** Section where picked poses are added. */
  targetId: string | undefined;
  poseMap: Map<string, Pose>;
  totalSeconds: number;
  onDone: () => void;
}) {
  const m = useMessages(M);
  const scroller = useRef<HTMLDivElement>(null);
  const count = sections.reduce((n, s) => n + s.items.length, 0);
  const target = sections.find((s) => s.id === targetId);
  const lastOfTarget = target?.items.at(-1)?.id;

  useEffect(() => {
    if (!lastOfTarget) return;
    scroller.current
      ?.querySelector(`[data-strip-item="${lastOfTarget}"]`)
      ?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [lastOfTarget, count]);

  // Numbering runs continuously across sections.
  const offsets = sections.map((_, i) => sections.slice(0, i).reduce((n, s) => n + s.items.length, 0));
  return (
    <div className="shrink-0 border-t border-line bg-surface px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 text-sm">
        <p className="min-w-0 flex-1 truncate">
          <span className="font-semibold">{m.myFlow}</span>
          <span className="text-muted">
            {" "}
            · {plural(m.poses, count)} · {formatDuration(totalSeconds)}
            {target && ` · ${format(m.addingTo, { title: target.title })}`}
          </span>
        </p>
        <button type="button" className="btn-primary shrink-0 py-1.5" onClick={onDone}>
          {m.view}
        </button>
      </div>
      {count === 0 ? (
        <p className="py-3 text-sm text-muted">{m.empty}</p>
      ) : (
        <div ref={scroller} className="scrollbar-none -mx-1 mt-2 flex items-start gap-2 overflow-x-auto px-1 pt-1 pb-0.5">
          {sections.map((section, sectionIndex) =>
            section.items.length === 0 ? null : (
              <div key={section.id} className="flex shrink-0 items-start gap-2">
                {/* Section boundary */}
                {offsets[sectionIndex] > 0 && (
                  <span className="mx-1 h-12 w-px shrink-0 self-center bg-line sm:h-16" aria-hidden />
                )}
                {section.items.map((item, itemIndex) => {
                  const pose = poseMap.get(item.poseId);
                  return (
                    // 56 px on phones; 80 px with the name on tablets.
                    <div key={item.id} data-strip-item={item.id} className="relative w-14 shrink-0 sm:w-20" title={pose?.name}>
                      {pose ? <PoseThumb pose={pose} /> : <div className="aspect-square w-full rounded-lg bg-surface-2" />}
                      <span className="absolute -top-1 -left-1 rounded-full bg-foreground px-1.5 text-[11px] leading-[18px] font-semibold text-background">
                        {offsets[sectionIndex] + itemIndex + 1}
                      </span>
                      <span className="mt-1 hidden text-center text-[11px] leading-tight font-medium sm:line-clamp-2">
                        {pose?.name ?? m.deleted}
                      </span>
                    </div>
                  );
                })}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
