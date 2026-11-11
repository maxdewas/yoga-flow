"use client";

import { Copy, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Pose, SequenceItem } from "@/lib/types";

interface Props {
  item: SequenceItem;
  pose: Pose | undefined;
  onChange: (patch: Partial<SequenceItem>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

/** Consigne de guidage d'une posture du cours, avec les consignes de la fiche à insérer en un clic. */
export function ItemEditor({ item, pose, onChange, onRemove, onDuplicate }: Props) {
  const chips = pose?.details?.cuesShort ?? [];
  return (
    <div className="animate-fade space-y-2.5 rounded-2xl bg-surface-2/70 p-3">
      <textarea
        className="input bg-surface"
        rows={2}
        autoFocus
        placeholder="Consigne de guidage / transition : « Inspire, allonge la colonne… »"
        value={item.cue}
        onChange={(e) => onChange({ cue: e.target.value })}
      />
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted">Consignes de la fiche</span>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              className="chip text-left font-medium"
              title="Ajouter à la consigne"
              onClick={() => onChange({ cue: item.cue ? `${item.cue.trimEnd()}\n${c}` : c })}
            >
              + {c}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        <button className="btn py-1.5" onClick={onDuplicate}>
          <Copy size={14} /> Dupliquer
        </button>
        {pose && (
          <Link href={`/postures/${pose.id}`} className="btn py-1.5">
            <ExternalLink size={14} /> Fiche
          </Link>
        )}
        <button className="btn py-1.5 text-danger" onClick={onRemove}>
          <Trash2 size={14} /> Retirer
        </button>
      </div>
    </div>
  );
}
