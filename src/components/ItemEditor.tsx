"use client";

import { Copy, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useMessages } from "@/lib/i18n";
import type { Pose, SequenceItem } from "@/lib/types";

const M = {
  fr: {
    cuePlaceholder: "Consigne de guidage / transition : « Inspire, allonge la colonne… »",
    sheetCues: "Consignes de la fiche", addToCue: "Ajouter à la consigne", duplicate: "Dupliquer", sheet: "Fiche", remove: "Retirer",
  },
  en: {
    cuePlaceholder: "Cue / transition: “Inhale, lengthen the spine…”",
    sheetCues: "Cues from the pose sheet", addToCue: "Add to the cue", duplicate: "Duplicate", sheet: "Pose sheet", remove: "Remove",
  },
  es: {
    cuePlaceholder: "Indicación / transición: «Inhala, alarga la columna…»",
    sheetCues: "Indicaciones de la ficha", addToCue: "Añadir a la indicación", duplicate: "Duplicar", sheet: "Ficha", remove: "Quitar",
  },
};

interface Props {
  item: SequenceItem;
  pose: Pose | undefined;
  onChange: (patch: Partial<SequenceItem>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

/** Cue of a pose in the class, with the pose sheet's cues insertable in one click. */
export function ItemEditor({ item, pose, onChange, onRemove, onDuplicate }: Props) {
  const m = useMessages(M);
  const chips = pose?.details?.cuesShort ?? [];
  const box = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLTextAreaElement>(null);

  // In the card view the editor opens under the whole grid, possibly off screen: bring it into view.
  // Focus the cue only with a mouse or trackpad; on touch it would pop the keyboard before the teacher asks.
  useEffect(() => {
    box.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (window.matchMedia("(pointer: fine)").matches) cue.current?.focus({ preventScroll: true });
  }, [item.id]);

  return (
    <div ref={box} className="animate-fade scroll-mb-24 space-y-2.5 rounded-2xl bg-surface-2/70 p-3">
      <textarea
        ref={cue}
        className="input bg-surface"
        rows={2}
        placeholder={m.cuePlaceholder}
        value={item.cue}
        onChange={(e) => onChange({ cue: e.target.value })}
      />
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted">{m.sheetCues}</span>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              className="chip text-left font-medium"
              title={m.addToCue}
              onClick={() => onChange({ cue: item.cue ? `${item.cue.trimEnd()}\n${c}` : c })}
            >
              + {c}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        <button className="btn py-1.5" onClick={onDuplicate}>
          <Copy size={14} /> {m.duplicate}
        </button>
        {pose && (
          <Link href={`/postures/${pose.id}`} className="btn py-1.5">
            <ExternalLink size={14} /> {m.sheet}
          </Link>
        )}
        <button className="btn py-1.5 text-danger" onClick={onRemove}>
          <Trash2 size={14} /> {m.remove}
        </button>
      </div>
    </div>
  );
}
