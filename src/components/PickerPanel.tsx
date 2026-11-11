"use client";

import { ChevronDown, Plus, RefreshCw, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { formatDuration, itemSeconds } from "@/lib/duration";
import { format, useLabels, useLocale, useMessages } from "@/lib/i18n";
import { BUILTIN_SEQUENCES, SEQUENCE_ROLE_LABELS, SEQUENCE_ROLES } from "@/lib/sequences";
import { usePoseMap, useStore } from "@/lib/store";
import { itemsFromSteps } from "@/lib/templates";
import type { Level, Pose, SequenceItem } from "@/lib/types";
import { LEVEL_DOT, PoseBrowser } from "./PoseBrowser";
import { PoseThumb } from "./PoseThumb";

const M = {
  fr: {
    poses: "Postures",
    sequences: "Enchaînements",
    closePanel: "Fermer le panneau",
    after: "Après « {name} »",
    toStart: "Pour commencer",
    moreIdeas: "Autres idées",
    addToClass: "Ajouter {name} au cours",
    mine: "Mes enchaînements",
    mineEmpty:
      "Coche des postures dans ton cours puis « Enregistrer » : l'enchaînement apparaîtra ici, réutilisable dans tous tes cours.",
    custom: "Perso",
    confirmDelete: "Supprimer l'enchaînement « {title} » ?",
    poseCount: "{n} postures",
    delete: "Supprimer {title}",
    add: "Ajouter",
    breaths: "{n} resp.",
  },
  en: {
    poses: "Poses",
    sequences: "Sequences",
    closePanel: "Close panel",
    after: "After “{name}”",
    toStart: "To begin",
    moreIdeas: "More ideas",
    addToClass: "Add {name} to the class",
    mine: "My sequences",
    mineEmpty: "Tick poses in your class, then “Save”: the sequence will appear here, reusable in all your classes.",
    custom: "Mine",
    confirmDelete: "Delete the sequence “{title}”?",
    poseCount: "{n} poses",
    delete: "Delete {title}",
    add: "Add",
    breaths: "{n} breaths",
  },
  es: {
    poses: "Posturas",
    sequences: "Secuencias",
    closePanel: "Cerrar el panel",
    after: "Después de «{name}»",
    toStart: "Para empezar",
    moreIdeas: "Otras ideas",
    addToClass: "Añadir {name} a la clase",
    mine: "Mis secuencias",
    mineEmpty: "Marca posturas en tu clase y luego «Guardar»: la secuencia aparecerá aquí, reutilizable en todas tus clases.",
    custom: "Propia",
    confirmDelete: "¿Eliminar la secuencia «{title}»?",
    poseCount: "{n} posturas",
    delete: "Eliminar {title}",
    add: "Añadir",
    breaths: "{n} resp.",
  },
};

interface Props {
  counts: Map<string, number>;
  onPick: (pose: Pose) => void;
  onAddItems: (items: SequenceItem[], label: string) => void;
  suggestions: Pose[];
  suggestFor: string | null;
  onRefreshSuggestions: () => void;
  onClose: () => void;
  /** Shown under the list, e.g. the class being built when the picker covers the editor. */
  footer?: ReactNode;
}

export function PickerPanel({
  counts,
  onPick,
  onAddItems,
  suggestions,
  suggestFor,
  onRefreshSuggestions,
  onClose,
  footer,
}: Props) {
  const t = useMessages(M);
  const [tab, setTab] = useState<"postures" | "enchainements">("postures");
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <div className="grid grid-cols-2 rounded-full bg-surface-2 p-1 text-sm font-semibold">
          {(["postures", "enchainements"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-1.5 transition ${tab === id ? "bg-surface text-accent shadow-soft" : "text-muted hover:text-foreground"}`}
            >
              {id === "postures" ? t.poses : t.sequences}
            </button>
          ))}
        </div>
        <button className="icon-btn ml-auto" onClick={onClose} aria-label={t.closePanel}>
          <X size={18} />
        </button>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
        {tab === "postures" ? (
          <PoseBrowser
            dense
            onPick={onPick}
            counts={counts}
            header={
              suggestions.length > 0 && (
                <div className="rounded-2xl bg-accent-soft/60 p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-accent">
                    <Sparkles size={13} />
                    <span className="truncate">{suggestFor ? format(t.after, { name: suggestFor }) : t.toStart}</span>
                    <button className="ml-auto rounded-full p-1 hover:bg-surface/70" onClick={onRefreshSuggestions} aria-label={t.moreIdeas}>
                      <RefreshCw size={13} />
                    </button>
                  </div>
                  <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onPick(p)}
                        className="w-[84px] shrink-0 rounded-xl bg-surface p-1 text-center shadow-soft transition hover:-translate-y-0.5"
                        aria-label={format(t.addToClass, { name: p.name })}
                      >
                        <PoseThumb pose={p} className="rounded-lg" />
                        <span className="mt-1 line-clamp-2 block text-[11px] leading-tight font-semibold">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            }
          />
        ) : (
          <SequenceList onAddItems={onAddItems} />
        )}
      </div>
      {footer}
    </div>
  );
}

function SequenceList({ onAddItems }: { onAddItems: Props["onAddItems"] }) {
  const t = useMessages(M);
  const locale = useLocale();
  const poseMap = usePoseMap();
  const saved = useStore((s) => s.sequences);
  const deleteSequence = useStore((s) => s.deleteSequence);
  const isSided = (id: string) => poseMap.get(id)?.sided ?? false;

  const builtins = useMemo(
    () => BUILTIN_SEQUENCES.map((q) => ({ ...q, items: itemsFromSteps(q.steps, (id) => poseMap.get(id)?.sided ?? false) })),
    [poseMap],
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-lg font-semibold">{t.mine}</h3>
        {saved.length === 0 ? (
          <p className="mt-1 rounded-2xl border border-dashed border-line p-3 text-sm text-muted">
            {t.mineEmpty}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {saved.map((q) => (
              <SequenceCard
                key={q.id}
                title={q.title}
                subtitle={t.custom}
                items={q.items.map((it) => ({ ...it, id: "" }))}
                poseMap={poseMap}
                onAdd={() => onAddItems(q.items.map((it) => ({ ...it, id: crypto.randomUUID() })), q.title)}
                onDelete={() => confirm(format(t.confirmDelete, { title: q.title })) && deleteSequence(q.id)}
              />
            ))}
          </ul>
        )}
      </div>
      {SEQUENCE_ROLES.map((role) => (
        <div key={role}>
          <h3 className="font-display text-lg font-semibold">{SEQUENCE_ROLE_LABELS[locale][role]}</h3>
          <ul className="mt-2 space-y-2">
            {builtins
              .filter((q) => q.role === role)
              .map((q) => (
                <SequenceCard
                  key={q.id}
                  title={q.title[locale]}
                  level={q.level}
                  items={q.items}
                  poseMap={poseMap}
                  onAdd={() => onAddItems(itemsFromSteps(q.steps, isSided), q.title[locale])}
                />
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SequenceCard({
  title,
  subtitle,
  level,
  items,
  poseMap,
  onAdd,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  level?: Level;
  items: SequenceItem[];
  poseMap: Map<string, Pose>;
  onAdd: () => void;
  onDelete?: () => void;
}) {
  const t = useMessages(M);
  const L = useLabels();
  const [open, setOpen] = useState(false);
  const seconds = items.reduce((n, it) => n + itemSeconds(it), 0);
  const poses = items.map((it) => poseMap.get(it.poseId));
  return (
    <li className="rounded-2xl border border-line bg-surface p-3 transition hover:border-accent/40">
      <div className="flex items-center gap-3">
        <button className="min-w-0 flex-1 text-left" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="truncate">{title}</span>
            <ChevronDown size={15} className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`} />
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            {level && <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[level]}`} />}
            {[subtitle, level && L.level[level], format(t.poseCount, { n: items.length }), `≈ ${formatDuration(seconds)}`].filter(Boolean).join(" · ")}
          </span>
        </button>
        {onDelete && (
          <button className="icon-btn h-8 w-8 hover:text-danger" onClick={onDelete} aria-label={format(t.delete, { title })}>
            <Trash2 size={15} />
          </button>
        )}
        <button className="btn-primary px-3 py-1.5 text-xs" onClick={onAdd}>
          <Plus size={14} /> {t.add}
        </button>
      </div>
      <div className="mt-2.5 flex -space-x-2">
        {poses.slice(0, 9).map((p, i) =>
          p ? (
            <span key={i} className="overflow-hidden rounded-full border-2 border-surface bg-thumb">
              <PoseThumb pose={p} size={34} className="rounded-full" />
            </span>
          ) : null,
        )}
        {poses.length > 9 && (
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-surface bg-surface-2 text-xs font-bold text-muted">
            +{poses.length - 9}
          </span>
        )}
      </div>
      {open && (
        <ol className="mt-3 space-y-1 border-t border-line pt-2 text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-5 text-right text-xs text-muted">{i + 1}</span>
              <span className="flex-1 truncate">{poses[i]?.name ?? it.poseId}</span>
              <span className="text-xs text-muted">
                {it.unit === "respirations" ? format(t.breaths, { n: it.hold }) : formatDuration(it.hold)}
                {it.side !== "aucun" && ` · ${L.sideShort[it.side]}`}
              </span>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}
