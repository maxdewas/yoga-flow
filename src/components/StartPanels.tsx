"use client";

import { Clock, LayoutTemplate, Sparkles, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { formatDuration } from "@/lib/duration";
import type { GeneratorOptions } from "@/lib/generator";
import { useLabels, useLocale, useMessages } from "@/lib/i18n";
import { TEMPLATES, type Template } from "@/lib/templates";
import type { Category, ClassStyle, Level } from "@/lib/types";

const M = {
  fr: {
    close: "Fermer",
    generateTitle: "Générer un cours",
    generateIntro:
      "Une séquence complète (centrage, échauffement, salutations, debout, posture au sommet, contre-postures, sol, relaxation) adaptée au style, au niveau et à la durée. Tout reste modifiable ensuite.",
    style: "Style",
    level: "Niveau",
    duration: "Durée",
    focus: "Focus",
    balanced: "Équilibré",
    generate: "Générer le cours",
    templatesTitle: "Cours prêts à l'emploi",
  },
  en: {
    close: "Close",
    generateTitle: "Generate a class",
    generateIntro:
      "A complete sequence (centering, warm-up, salutations, standing, peak pose, counter-poses, floor, relaxation) tailored to the style, level and length. Everything stays editable afterwards.",
    style: "Style",
    level: "Level",
    duration: "Length",
    focus: "Focus",
    balanced: "Balanced",
    generate: "Generate class",
    templatesTitle: "Ready-made classes",
  },
  es: {
    close: "Cerrar",
    generateTitle: "Generar una clase",
    generateIntro:
      "Una secuencia completa (centramiento, calentamiento, saludos, de pie, postura cumbre, contraposturas, suelo, relajación) adaptada al estilo, al nivel y a la duración. Después puedes modificarlo todo.",
    style: "Estilo",
    level: "Nivel",
    duration: "Duración",
    focus: "Enfoque",
    balanced: "Equilibrado",
    generate: "Generar la clase",
    templatesTitle: "Clases listas para usar",
  },
};

export const DURATIONS = [20, 30, 45, 60, 75, 90];

export function Modal({ title, icon, onClose, children }: { title: string; icon?: ReactNode; onClose: () => void; children: ReactNode }) {
  const t = useMessages(M);
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
          <button className="icon-btn ml-auto" onClick={onClose} aria-label={t.close}>
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
  const t = useMessages(M);
  const L = useLabels();
  const [style, setStyle] = useState<ClassStyle>(initial.style);
  const [level, setLevel] = useState<Level>(initial.level);
  const [targetMinutes, setTarget] = useState(initial.targetMinutes);
  const [focus, setFocus] = useState<Category | "">("");
  return (
    <Modal title={t.generateTitle} icon={<Sparkles size={20} />} onClose={onClose}>
      <p className="mb-5 text-sm text-muted">{t.generateIntro}</p>
      <div className="space-y-4">
        <ChipGroup
          label={t.style}
          value={style}
          onChange={setStyle}
          options={(Object.keys(L.style) as ClassStyle[]).map((s) => ({ id: s, label: L.style[s] }))}
        />
        <ChipGroup
          label={t.level}
          value={level}
          onChange={setLevel}
          options={(Object.keys(L.level) as Level[]).map((l) => ({ id: l, label: L.level[l] }))}
        />
        <ChipGroup label={t.duration} value={targetMinutes} onChange={setTarget} options={DURATIONS.map((d) => ({ id: d, label: `${d} min` }))} />
        <ChipGroup
          label={t.focus}
          value={focus}
          onChange={setFocus}
          options={[
            { id: "" as Category | "", label: t.balanced },
            ...(Object.keys(L.category) as Category[]).map((c) => ({ id: c as Category | "", label: L.category[c] })),
          ]}
        />
      </div>
      <button className="btn-primary mt-6 w-full py-3 text-base" onClick={() => onGenerate({ style, level, targetMinutes, focus: focus || null })}>
        <Sparkles size={18} /> {t.generate}
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
  const t = useMessages(M);
  const L = useLabels();
  const locale = useLocale();
  return (
    <Modal title={t.templatesTitle} icon={<LayoutTemplate size={20} />} onClose={onClose}>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {TEMPLATES.map((tpl) => (
          <li key={tpl.id}>
            <button
              className="h-full w-full rounded-2xl border border-line bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-soft"
              onClick={() => onPick(tpl)}
            >
              <span className="text-[11px] font-bold tracking-wider text-accent uppercase">{L.style[tpl.style]}</span>
              <span className="mt-0.5 block font-display text-lg leading-tight font-semibold">{tpl.title[locale]}</span>
              <span className="mt-1 block text-xs text-muted">{tpl.theme[locale]}</span>
              <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                <Clock size={12} /> ≈ {formatDuration(durationOf(tpl))} · {L.level[tpl.level]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
