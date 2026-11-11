"use client";

import { Check, Info, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useAllPoses } from "@/lib/store";
import { CATEGORY_LABELS, LEVEL_LABELS, type Category, type Level, type Pose } from "@/lib/types";
import { PoseThumb } from "./PoseThumb";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function matches(pose: Pose, q: string) {
  if (!q) return true;
  const hay = normalize(`${pose.nameFr} ${pose.sanskrit} ${pose.nameEn} ${pose.details?.otherNames?.join(" ") ?? ""}`);
  return normalize(q)
    .split(/\s+/)
    .every((w) => hay.includes(w));
}

export const LEVEL_DOT: Record<Level, string> = {
  debutant: "bg-accent",
  intermediaire: "bg-gold",
  avance: "bg-clay",
};

const SHORT_CATEGORY: Partial<Record<Category, string>> = {
  "ouverture-hanches": "Hanches",
  "equilibre-bras": "Équilibre bras",
};

type Access = "sans-inversion" | "chaise" | "yin" | "souffle";
const ACCESS: { id: Access; label: string; test: (p: Pose) => boolean }[] = [
  { id: "sans-inversion", label: "Sans inversion", test: (p) => !p.categories.includes("inversion") },
  { id: "chaise", label: "Sur chaise", test: (p) => /chaise/.test(p.id) && p.family === "assises" },
  { id: "yin", label: "Yin", test: (p) => p.id.startsWith("yin-") },
  { id: "souffle", label: "Souffle & méditation", test: (p) => /^(med|mudra|resp)-/.test(p.id) },
];

interface Props {
  /** When set, a pose card adds the pose (flow builder) instead of opening its page. */
  onPick?: (pose: Pose) => void;
  /** How many times each pose is already in the class (builder). */
  counts?: Map<string, number>;
  /** Shown between the filters and the grid (suggestions). */
  header?: ReactNode;
  /** Narrow side panel layout. */
  dense?: boolean;
}

export function PoseBrowser({ onPick, counts, header, dense = false }: Props) {
  const poses = useAllPoses();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [access, setAccess] = useState<Set<Access>>(new Set());

  const filtered = useMemo(() => {
    const tests = ACCESS.filter((a) => access.has(a.id));
    return poses
      .filter(
        (p) =>
          matches(p, q) &&
          (!category || p.categories.includes(category)) &&
          (!level || p.level === level) &&
          tests.every((a) => a.test(p)),
      )
      .sort((a, b) => a.nameFr.localeCompare(b.nameFr, "fr"));
  }, [poses, q, category, level, access]);

  const toggleAccess = (a: Access) =>
    setAccess((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  const anyFilter = q || category || level || access.size > 0;

  return (
    <div className="space-y-3">
      <label className="relative block">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
        <input
          className="input rounded-full pl-10"
          type="search"
          placeholder="Rechercher (français, sanskrit, anglais)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        <button className="chip" data-active={!category} onClick={() => setCategory(null)}>
          Toutes
        </button>
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
          <button key={c} className="chip" data-active={category === c} onClick={() => setCategory(category === c ? null : c)}>
            {SHORT_CATEGORY[c] ?? CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className={`flex gap-x-4 gap-y-2 ${dense ? "flex-col" : "flex-wrap items-center"}`}>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="w-14 shrink-0 text-[11px] font-bold tracking-wider text-muted uppercase">Niveau</span>
          <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
            {(Object.keys(LEVEL_LABELS) as Level[]).map((l) => (
              <button key={l} className="chip" data-active={level === l} onClick={() => setLevel(level === l ? null : l)}>
                <span className={`h-2 w-2 rounded-full ${LEVEL_DOT[l]} ${level === l ? "ring-2 ring-surface" : ""}`} />
                {LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="w-14 shrink-0 text-[11px] font-bold tracking-wider text-muted uppercase">Accès</span>
          <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
            {ACCESS.map((a) => (
              <button key={a.id} className="chip" data-active={access.has(a.id)} onClick={() => toggleAccess(a.id)}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {header}

      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          {filtered.length} posture{filtered.length > 1 ? "s" : ""}
        </span>
        {anyFilter && (
          <button
            className="inline-flex items-center gap-1 font-semibold hover:text-foreground"
            onClick={() => {
              setQ("");
              setCategory(null);
              setLevel(null);
              setAccess(new Set());
            }}
          >
            <X size={12} /> Effacer les filtres
          </button>
        )}
      </div>

      <ul
        className={`grid gap-2.5 ${
          dense ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        }`}
      >
        {filtered.map((pose) => (
          <PoseTile key={pose.id} pose={pose} onPick={onPick} count={counts?.get(pose.id) ?? 0} />
        ))}
      </ul>
      {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted">Aucune posture ne correspond à ces filtres.</p>}
    </div>
  );
}

function PoseTile({ pose, onPick, count }: { pose: Pose; onPick?: (p: Pose) => void; count: number }) {
  const body = (
    <>
      <span className="relative block">
        <PoseThumb pose={pose} className="rounded-xl" />
        {onPick && (
          <span
            className={`absolute top-1.5 right-1.5 flex h-7 min-w-7 items-center justify-center gap-0.5 rounded-full px-1.5 text-xs font-bold shadow-soft transition ${
              count ? "bg-accent text-surface" : "bg-surface/90 text-accent opacity-0 group-hover:opacity-100"
            }`}
          >
            {count ? (
              <>
                <Check size={13} strokeWidth={3} />
                {count > 1 && count}
              </>
            ) : (
              <Plus size={16} strokeWidth={2.5} />
            )}
          </span>
        )}
      </span>
      <span className="mt-2 flex items-start gap-1.5 px-0.5">
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_DOT[pose.level]}`} title={LEVEL_LABELS[pose.level]} />
        <span className="min-w-0">
          <span className="line-clamp-2 block text-[13px] leading-tight font-semibold">{pose.nameFr}</span>
          <span className="block truncate text-[11px] text-muted italic">{pose.sanskrit}</span>
        </span>
      </span>
    </>
  );
  const cls = `group relative block w-full rounded-2xl border bg-surface p-1.5 pb-2 text-left transition hover:-translate-y-0.5 hover:shadow-soft ${
    count ? "border-accent/60" : "border-line hover:border-accent/40"
  }`;
  return (
    <li className="group/tile relative">
      {onPick ? (
        <>
          <button className={cls} onClick={() => onPick(pose)} aria-label={`Ajouter ${pose.nameFr} au cours`}>
            {body}
          </button>
          <Link
            href={`/postures/${pose.id}`}
            aria-label={`Fiche de ${pose.nameFr}`}
            className="absolute top-3 left-3 hidden h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-muted shadow-soft group-hover/tile:flex hover:text-foreground"
          >
            <Info size={14} />
          </Link>
        </>
      ) : (
        <Link href={`/postures/${pose.id}`} className={cls}>
          {body}
        </Link>
      )}
    </li>
  );
}
