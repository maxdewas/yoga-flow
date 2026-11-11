"use client";

import { Clock, LayoutTemplate, Sparkles, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { formatDuration } from "@/lib/duration";
import type { GeneratorOptions } from "@/lib/generator";
import { TEMPLATES, type Template } from "@/lib/templates";
import { CATEGORY_LABELS, LEVEL_LABELS, STYLE_LABELS, type Category, type ClassStyle, type Level } from "@/lib/types";

export const DURATIONS = [20, 30, 45, 60, 75, 90];

export function Modal({ title, icon, onClose, children }: { title: string; icon?: ReactNode; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] flex animate-fade items-end justify-center bg-black/35 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-xl animate-rise overflow-y-auto rounded-t-3xl bg-background p-5 shadow-lift sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          {icon && <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">{icon}</span>}
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <button className="icon-btn ml-auto" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ChipGroup<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[11px] font-bold tracking-wider text-muted uppercase">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={String(o.id)} type="button" className="chip px-3.5 py-1.5 text-sm" data-active={o.id === value} onClick={() => onChange(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function GeneratorDialog({
  initial,
  onGenerate,
  onClose,
}: {
  initial: Omit<GeneratorOptions, "focus">;
  onGenerate: (opts: GeneratorOptions) => void;
  onClose: () => void;
}) {
  const [style, setStyle] = useState<ClassStyle>(initial.style);
  const [level, setLevel] = useState<Level>(initial.level);
  const [targetMinutes, setTarget] = useState(initial.targetMinutes);
  const [focus, setFocus] = useState<Category | "">("");
  return (
    <Modal title="Générer un cours" icon={<Sparkles size={20} />} onClose={onClose}>
      <p className="mb-5 text-sm text-muted">
        Une séquence complète (centrage, échauffement, salutations, debout, posture au sommet, contre-postures, sol,
        relaxation) adaptée au style, au niveau et à la durée. Tout reste modifiable ensuite.
      </p>
      <div className="space-y-4">
        <ChipGroup
          label="Style"
          value={style}
          onChange={setStyle}
          options={(Object.keys(STYLE_LABELS) as ClassStyle[]).map((s) => ({ id: s, label: STYLE_LABELS[s] }))}
        />
        <ChipGroup
          label="Niveau"
          value={level}
          onChange={setLevel}
          options={(Object.keys(LEVEL_LABELS) as Level[]).map((l) => ({ id: l, label: LEVEL_LABELS[l] }))}
        />
        <ChipGroup label="Durée" value={targetMinutes} onChange={setTarget} options={DURATIONS.map((d) => ({ id: d, label: `${d} min` }))} />
        <ChipGroup
          label="Focus"
          value={focus}
          onChange={setFocus}
          options={[
            { id: "" as Category | "", label: "Équilibré" },
            ...(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => ({ id: c as Category | "", label: CATEGORY_LABELS[c] })),
          ]}
        />
      </div>
      <button className="btn-primary mt-6 w-full py-3 text-base" onClick={() => onGenerate({ style, level, targetMinutes, focus: focus || null })}>
        <Sparkles size={18} /> Générer le cours
      </button>
    </Modal>
  );
}

export function TemplatesDialog({
  onPick,
  onClose,
  durationOf,
}: {
  onPick: (t: Template) => void;
  onClose: () => void;
  durationOf: (t: Template) => number;
}) {
  return (
    <Modal title="Cours prêts à l'emploi" icon={<LayoutTemplate size={20} />} onClose={onClose}>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <li key={t.id}>
            <button
              className="h-full w-full rounded-2xl border border-line bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-soft"
              onClick={() => onPick(t)}
            >
              <span className="text-[11px] font-bold tracking-wider text-accent uppercase">{STYLE_LABELS[t.style]}</span>
              <span className="mt-0.5 block font-display text-lg leading-tight font-semibold">{t.title}</span>
              <span className="mt-1 block text-xs text-muted">{t.theme}</span>
              <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                <Clock size={12} /> ≈ {formatDuration(durationOf(t))} · {LEVEL_LABELS[t.level]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
