"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PoseThumb } from "@/components/PoseThumb";
import { formatDuration, formatHold, planSeconds, sectionSeconds } from "@/lib/duration";
import { useHydrated, usePoseMap, useStore, type PrintPrefs } from "@/lib/store";
import { useLabels, useMessages, useLocale, type Locale } from "@/lib/i18n";
import type { Labels } from "@/lib/labels";
import type { ClassPlan, Pose, Section, SequenceItem } from "@/lib/types";

const M = {
  fr: {
    untitled: "Cours sans titre", deleted: "Posture supprimée", notFound: "Cours introuvable.", back: "← Retour à l'éditeur",
    layout: "Mise en page", grid: "Grille (paysage)", list: "Liste (portrait)", perPage: "Postures par page",
    images: "Images", cues: "Consignes", print: "Imprimer / Enregistrer en PDF", empty: "Ce cours ne contient encore aucune posture.",
  },
  en: {
    untitled: "Untitled class", deleted: "Deleted pose", notFound: "Class not found.", back: "← Back to the editor",
    layout: "Layout", grid: "Grid (landscape)", list: "List (portrait)", perPage: "Poses per page",
    images: "Images", cues: "Cues", print: "Print / Save as PDF", empty: "This class has no poses yet.",
  },
  es: {
    untitled: "Clase sin título", deleted: "Postura eliminada", notFound: "Clase no encontrada.", back: "← Volver al editor",
    layout: "Diseño", grid: "Cuadrícula (horizontal)", list: "Lista (vertical)", perPage: "Posturas por página",
    images: "Imágenes", cues: "Indicaciones", print: "Imprimir / Guardar como PDF", empty: "Esta clase aún no tiene posturas.",
  },
};

/** Poses per landscape page → [columns, rows] on an A4 sheet. */
const GRIDS: Record<number, [number, number]> = {
  2: [2, 1],
  4: [2, 2],
  6: [3, 2],
  8: [4, 2],
  12: [4, 3],
  15: [5, 3],
  20: [5, 4],
  24: [6, 4],
};
const PER_PAGE = Object.keys(GRIDS).map(Number);
const DEFAULT_PER_PAGE = 8;

interface Entry {
  item: SequenceItem;
  /** Numbering runs continuously across sections. */
  number: number;
  section: Section;
  firstOfSection: boolean;
}

function details(item: SequenceItem, L: Labels, locale: Locale) {
  return [
    formatHold(item, locale),
    item.side !== "aucun" && L.side[item.side],
    item.breath && item.breath !== "aucun" && L.breath[item.breath],
  ]
    .filter(Boolean)
    .join(" · ");
}

function GridCard({
  entry,
  pose,
  prefs,
  dense,
  compact,
  showSection,
}: {
  entry: Entry;
  pose: Pose | undefined;
  prefs: PrintPrefs;
  /** 5+ columns: smaller type. */
  dense: boolean;
  /** 3+ rows: one line of cue, so the image keeps room. */
  compact: boolean;
  showSection: boolean;
}) {
  const { item, number, section } = entry;
  const t = useMessages(M);
  const L = useLabels();
  const locale = useLocale();
  return (
    // Spans an image track and a text track of the page grid (subgrid): text blocks of a row line up,
    // and all image tracks share the remaining height equally, whatever the length of each name.
    <article className="row-span-2 mb-[3mm] grid min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-subgrid gap-y-[1.5mm] overflow-hidden rounded-[2mm] border border-line p-[2mm]">
      <div className="min-h-0">{prefs.images && pose && <PoseThumb pose={pose} fill eager />}</div>
      <div>
        {showSection && (
          <p className="truncate text-[7pt] font-semibold tracking-wide text-accent uppercase">{section.title}</p>
        )}
        {/* The name is never cut. */}
        <p className={`leading-tight font-semibold ${dense ? "text-[9pt]" : "text-[11pt]"}`}>
          <span className="text-muted">{number}.</span> {pose?.name ?? t.deleted}
        </p>
        {pose?.sanskrit && <p className="truncate text-[8pt] text-muted italic">{pose.sanskrit}</p>}
        <p className="truncate text-[8pt] text-muted">{details(item, L, locale)}</p>
        {prefs.cues && item.cue && (
          <p className={`mt-[0.5mm] text-[8pt] ${compact ? "line-clamp-1" : "line-clamp-2"}`}>{item.cue}</p>
        )}
      </div>
    </article>
  );
}

/** Landscape A4 sheets, `perPage` pose cards each. The sheet has the page's exact size, so the preview is the print. */
function GridLayout({ plan, entries, prefs }: { plan: ClassPlan; entries: Entry[]; prefs: PrintPrefs }) {
  const poseMap = usePoseMap();
  const t = useMessages(M);
  const L = useLabels();
  const perPage = GRIDS[prefs.perPage] ? prefs.perPage : DEFAULT_PER_PAGE;
  const [cols, rows] = GRIDS[perPage];
  const pages: Entry[][] = [];
  for (let i = 0; i < entries.length; i += perPage) pages.push(entries.slice(i, i + perPage));
  const meta = [plan.theme, L.level[plan.level], `≈ ${formatDuration(planSeconds(plan))}`].filter(Boolean).join(" · ");

  return pages.map((page, pageIndex) => (
    <div
      key={pageIndex}
      // 209 mm, not 210: a sheet a hair too tall would spill an empty page after each one.
      className="paper mx-auto mb-6 flex h-[209mm] w-[297mm] flex-col overflow-hidden p-[10mm] shadow-lift break-after-page last:break-after-auto print:mb-0 print:shadow-none"
    >
      <header className="mb-[4mm] flex shrink-0 items-baseline gap-[4mm] border-b border-line pb-[2mm]">
        <h1 className="truncate font-display text-[16pt] leading-tight font-semibold">{plan.title || t.untitled}</h1>
        <span className="truncate text-[9pt] text-muted">{meta}</span>
        {pages.length > 1 && (
          <span className="ml-auto shrink-0 text-[9pt] text-muted">
            {pageIndex + 1} / {pages.length}
          </span>
        )}
      </header>
      <div
        // Two tracks per row of cards: the image (shares the free height) and the text (as tall as needed).
        className="grid min-h-0 flex-1 gap-x-[3mm]"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr) auto)`,
          rowGap: 0,
        }}
      >
        {page.map((entry, i) => (
          <GridCard
            key={entry.item.id}
            entry={entry}
            pose={poseMap.get(entry.item.poseId)}
            prefs={prefs}
            dense={cols >= 5}
            compact={rows >= 3}
            showSection={entry.firstOfSection || i === 0}
          />
        ))}
      </div>
    </div>
  ));
}

/** Portrait list with sections, intention and notes. */
function ListLayout({ plan, prefs }: { plan: ClassPlan; prefs: PrintPrefs }) {
  const poseMap = usePoseMap();
  const t = useMessages(M);
  const L = useLabels();
  const locale = useLocale();
  const offsets = plan.sections.map((_, i) => plan.sections.slice(0, i).reduce((n, s) => n + s.items.length, 0));
  return (
    <div className="paper mx-auto max-w-3xl rounded-xl p-8 shadow-lift print:rounded-none print:p-0 print:shadow-none">
      <header className="mb-5 border-b border-line pb-3">
        <h1 className="font-display text-3xl font-semibold">{plan.title}</h1>
        <p className="text-sm text-muted">
          {[plan.theme, L.level[plan.level], `≈ ${formatDuration(planSeconds(plan))}`].filter(Boolean).join(" · ")}
        </p>
        {plan.intention && <p className="mt-2 italic">{plan.intention}</p>}
        {plan.notes && <p className="mt-2 text-sm whitespace-pre-line">{plan.notes}</p>}
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
                  {prefs.images && pose && <PoseThumb pose={pose} size={48} eager />}
                  <div className="flex-1">
                    <p>
                      <strong>{pose?.name ?? t.deleted}</strong>{" "}
                      <span className="text-sm text-muted italic">{pose?.sanskrit}</span>
                    </p>
                    <p className="text-sm text-muted">{details(item, L, locale)}</p>
                    {prefs.cues && item.cue && <p className="text-sm whitespace-pre-line">{item.cue}</p>}
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

export default function PrintPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const plan = useStore((s) => s.plans.find((p) => p.id === id));
  const prefs = useStore((s) => s.prefs.print);
  const setPrefs = useStore((s) => s.setPrefs);
  const t = useMessages(M);
  const setPrint = (patch: Partial<PrintPrefs>) => setPrefs({ print: patch });

  if (!hydrated) return null;
  if (!plan) return <p className="p-6">{t.notFound}</p>;

  const grid = prefs.layout === "grille";
  let number = 0;
  const entries: Entry[] = plan.sections.flatMap((section) =>
    section.items.map((item, i) => ({ item, number: ++number, section, firstOfSection: i === 0 })),
  );

  const segment = (active: boolean) =>
    `rounded-full px-3 py-1 font-semibold transition ${active ? "bg-accent text-surface" : "text-muted hover:text-foreground"}`;

  return (
    <div className="w-full overflow-x-auto px-4 py-6 print:overflow-visible print:p-0">
      {/* The grid sheet carries its own 10 mm margin, so the printer adds none. */}
      <style>{`@page { size: A4 ${grid ? "landscape" : "portrait"}; margin: ${grid ? "0" : "12mm"}; }`}</style>

      <div className="no-print mx-auto mb-6 flex max-w-[297mm] flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3 text-sm">
        <Link href={`/cours/${plan.id}`} className="btn">
          {t.back}
        </Link>
        <div className="flex rounded-full bg-surface-2 p-0.5" role="group" aria-label={t.layout}>
          <button type="button" className={segment(grid)} aria-pressed={grid} onClick={() => setPrint({ layout: "grille" })}>
            {t.grid}
          </button>
          <button type="button" className={segment(!grid)} aria-pressed={!grid} onClick={() => setPrint({ layout: "liste" })}>
            {t.list}
          </button>
        </div>
        {grid && (
          <label className="flex items-center gap-1.5">
            {t.perPage}
            <select
              className="rounded-lg border border-line bg-surface px-2 py-1"
              value={GRIDS[prefs.perPage] ? prefs.perPage : DEFAULT_PER_PAGE}
              onChange={(e) => setPrint({ perPage: Number(e.target.value) })}
            >
              {PER_PAGE.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={prefs.images} onChange={(e) => setPrint({ images: e.target.checked })} /> {t.images}
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={prefs.cues} onChange={(e) => setPrint({ cues: e.target.checked })} /> {t.cues}
        </label>
        <button className="btn-primary ml-auto" onClick={() => window.print()}>
          {t.print}
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-center text-muted">{t.empty}</p>
      ) : grid ? (
        <GridLayout plan={plan} entries={entries} prefs={prefs} />
      ) : (
        <ListLayout plan={plan} prefs={prefs} />
      )}
    </div>
  );
}
