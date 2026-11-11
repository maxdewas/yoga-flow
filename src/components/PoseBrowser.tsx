"use client";

import { Check, Info, Layers, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { format, useLabels, useLocale, useMessages } from "@/lib/i18n";
import { useAllPoses } from "@/lib/store";
import type { Category, Level, Pose } from "@/lib/types";
import { PoseThumb } from "./PoseThumb";

const M = {
  fr: {
    search: "Rechercher (français, sanskrit, anglais)…",
    all: "Toutes",
    level: "Niveau",
    access: "Accès",
    count: "{n} posture(s)",
    countOf: "{n} sur {total}",
    clear: "Effacer les filtres",
    none: "Aucune posture ne correspond à ces filtres.",
    more: "Afficher plus ({n} de plus)",
    variants: "Variantes",
    variantsHint: "Afficher aussi les variantes (la recherche les inclut toujours)",
    variantCount: "+{n} variante(s)",
    add: "Ajouter {name} au cours",
    sheet: "Fiche de {name}",
    filters: { "sans-inversion": "Sans inversion", chaise: "Sur chaise", yin: "Yin", souffle: "Souffle & méditation" },
  },
  en: {
    search: "Search (English, Sanskrit, French)…",
    all: "All",
    level: "Level",
    access: "Access",
    count: "{n} pose(s)",
    countOf: "{n} of {total}",
    clear: "Clear filters",
    none: "No pose matches these filters.",
    more: "Show more ({n} more)",
    variants: "Variations",
    variantsHint: "Also show variations (search always includes them)",
    variantCount: "+{n} variation(s)",
    add: "Add {name} to the class",
    sheet: "{name} sheet",
    filters: { "sans-inversion": "No inversions", chaise: "On a chair", yin: "Yin", souffle: "Breath & meditation" },
  },
  es: {
    search: "Buscar (español, sánscrito, inglés)…",
    all: "Todas",
    level: "Nivel",
    access: "Acceso",
    count: "{n} postura(s)",
    countOf: "{n} de {total}",
    clear: "Borrar filtros",
    none: "Ninguna postura coincide con estos filtros.",
    more: "Mostrar más ({n} más)",
    variants: "Variantes",
    variantsHint: "Mostrar también las variantes (la búsqueda siempre las incluye)",
    variantCount: "+{n} variante(s)",
    add: "Añadir {name} a la clase",
    sheet: "Ficha de {name}",
    filters: { "sans-inversion": "Sin inversiones", chaise: "En silla", yin: "Yin", souffle: "Respiración y meditación" },
  },
};

/** "{n} posture(s)" → singular or plural form. */
export const plural = (template: string, n: number) =>
  format(template.replace(/\((\w+)\)/g, n > 1 ? "$1" : ""), { n });

const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Search text per pose, computed once per pose object (poses are rebuilt when the language changes). */
const haystacks = new WeakMap<Pose, string>();
function haystack(p: Pose) {
  let h = haystacks.get(p);
  if (h == null) {
    h = normalize(`${p.name} ${p.nameFr} ${p.sanskrit} ${p.nameEn} ${p.details?.otherNames?.join(" ") ?? ""}`);
    haystacks.set(p, h);
  }
  return h;
}

export const LEVEL_DOT: Record<Level, string> = {
  debutant: "bg-accent",
  intermediaire: "bg-gold",
  avance: "bg-clay",
};

type Access = "sans-inversion" | "chaise" | "yin" | "souffle";
const STILLNESS_TAGS = ["mudras", "pranayama", "meditative", "kriya", "shat-kriya"];
const ACCESS: { id: Access; test: (p: Pose) => boolean }[] = [
  { id: "sans-inversion", test: (p) => !p.categories.includes("inversion") },
  {
    id: "chaise",
    test: (p) => (/chaise/.test(p.id) && p.family === "assises") || Boolean(p.details?.equipment?.includes("chaise")),
  },
  { id: "yin", test: (p) => p.id.startsWith("yin-") || Boolean(p.details?.styles?.some((s) => /^yin/i.test(s))) },
  {
    id: "souffle",
    test: (p) =>
      /^(med|mudra|resp)-/.test(p.id) ||
      Boolean(p.details?.tags?.some((t) => STILLNESS_TAGS.includes(t))) ||
      Boolean(p.details?.types?.some((t) => t === "respiration" || t === "meditation")),
  },
];

/** Tiles rendered at once: the catalogue holds thousands of poses. */
const PAGE = 120;

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
  const t = useMessages(M);
  const L = useLabels();
  const locale = useLocale();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [access, setAccess] = useState<Set<Access>>(new Set());
  const [withVariants, setWithVariants] = useState(false);
  const [shown, setShown] = useState(PAGE);

  const filtered = useMemo(() => {
    const tests = ACCESS.filter((a) => access.has(a.id));
    const words = normalize(q).split(/\s+/).filter(Boolean);
    // Variations stay folded under their base pose, unless asked for or searched.
    const variantsVisible = withVariants || words.length > 0;
    const collator = new Intl.Collator(locale);
    return poses
      .filter(
        (p) =>
          (variantsVisible || !p.variantOf) &&
          (!words.length || words.every((w) => haystack(p).includes(w))) &&
          (!category || p.categories.includes(category)) &&
          (!level || p.level === level) &&
          tests.every((a) => a.test(p)),
      )
      .sort((a, b) => collator.compare(a.name, b.name));
  }, [poses, q, category, level, access, withVariants, locale]);

  const resetPage = () => setShown(PAGE);
  const toggleAccess = (a: Access) => {
    resetPage();
    setAccess((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  };
  const anyFilter = q || category || level || access.size > 0 || withVariants;
  const visible = filtered.slice(0, shown);

  return (
    <div className="space-y-3">
      <label className="relative block">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
        <input
          className="input rounded-full pl-10"
          type="search"
          placeholder={t.search}
          value={q}
          onChange={(e) => {
            resetPage();
            setQ(e.target.value);
          }}
        />
      </label>

      <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        <button className="chip" data-active={!category} onClick={() => (resetPage(), setCategory(null))}>
          {t.all}
        </button>
        {(Object.keys(L.category) as Category[]).map((c) => (
          <button key={c} className="chip" data-active={category === c} onClick={() => (resetPage(), setCategory(category === c ? null : c))}>
            {L.categoryShort[c] ?? L.category[c]}
          </button>
        ))}
      </div>

      <div className={`flex gap-x-4 gap-y-2 ${dense ? "flex-col" : "flex-wrap items-center"}`}>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="w-14 shrink-0 text-[11px] font-bold tracking-wider text-muted uppercase">{t.level}</span>
          <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
            {(Object.keys(L.level) as Level[]).map((l) => (
              <button key={l} className="chip" data-active={level === l} onClick={() => (resetPage(), setLevel(level === l ? null : l))}>
                <span className={`h-2 w-2 rounded-full ${LEVEL_DOT[l]} ${level === l ? "ring-2 ring-surface" : ""}`} />
                {L.level[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="w-14 shrink-0 text-[11px] font-bold tracking-wider text-muted uppercase">{t.access}</span>
          <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
            {ACCESS.map((a) => (
              <button key={a.id} className="chip" data-active={access.has(a.id)} onClick={() => toggleAccess(a.id)}>
                {t.filters[a.id]}
              </button>
            ))}
            <button
              className="chip"
              data-active={withVariants}
              title={t.variantsHint}
              onClick={() => (resetPage(), setWithVariants((v) => !v))}
            >
              <Layers size={12} /> {t.variants}
            </button>
          </div>
        </div>
      </div>

      {header}

      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          {filtered.length > visible.length
            ? format(t.countOf, { n: visible.length, total: filtered.length })
            : plural(t.count, filtered.length)}
        </span>
        {anyFilter && (
          <button
            className="inline-flex items-center gap-1 font-semibold hover:text-foreground"
            onClick={() => {
              resetPage();
              setQ("");
              setCategory(null);
              setLevel(null);
              setAccess(new Set());
              setWithVariants(false);
            }}
          >
            <X size={12} /> {t.clear}
          </button>
        )}
      </div>

      <ul
        className={`grid gap-2.5 ${
          dense ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        }`}
      >
        {visible.map((pose) => (
          <PoseTile key={pose.id} pose={pose} onPick={onPick} count={counts?.get(pose.id) ?? 0} />
        ))}
      </ul>
      {filtered.length > visible.length && (
        <div className="flex justify-center">
          <button className="btn" onClick={() => setShown((n) => n + PAGE * 2)}>
            {format(t.more, { n: Math.min(PAGE * 2, filtered.length - visible.length) })}
          </button>
        </div>
      )}
      {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted">{t.none}</p>}
    </div>
  );
}

function PoseTile({ pose, onPick, count }: { pose: Pose; onPick?: (p: Pose) => void; count: number }) {
  const t = useMessages(M);
  const L = useLabels();
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
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_DOT[pose.level]}`} title={L.level[pose.level]} />
        <span className="min-w-0">
          <span className="line-clamp-2 block text-[13px] leading-tight font-semibold">{pose.name}</span>
          <span className="block truncate text-[11px] text-muted italic">{pose.sanskrit}</span>
          {pose.variants?.length ? (
            <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
              <Layers size={11} /> {plural(t.variantCount, pose.variants.length)}
            </span>
          ) : null}
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
          <button className={cls} onClick={() => onPick(pose)} aria-label={format(t.add, { name: pose.name })}>
            {body}
          </button>
          <Link
            href={`/postures/${pose.id}`}
            aria-label={format(t.sheet, { name: pose.name })}
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
