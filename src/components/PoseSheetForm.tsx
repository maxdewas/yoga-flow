"use client";

import { useState, type ReactNode } from "react";
import {
  CHAKRA_LABELS,
  DOSHA_LABELS,
  ELEMENT_LABELS,
  GUNA_LABELS,
  KOSHA_LABELS,
  POSITION_LABELS,
  SUITABILITY_LABELS,
  TYPE_LABELS,
  VAYU_LABELS,
  type PoseDetails,
  type Position,
  type Suitability,
} from "@/lib/details";
import type { PoseEdit } from "@/lib/store";
import { CATEGORY_LABELS, LEVEL_LABELS, type Category, type Level, type Pose } from "@/lib/types";

// ——— helpers: lists are edited as one item per line ———
const toLines = (xs?: string[]) => (xs ?? []).join("\n");
const fromLines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const toPairs = (xs: { a: string; b: string }[] | undefined) => (xs ?? []).map((x) => `${x.a} : ${x.b}`).join("\n");
const fromPairs = (s: string) =>
  fromLines(s).map((l) => {
    const i = l.indexOf(":");
    return i < 0 ? { a: "", b: l } : { a: l.slice(0, i).trim(), b: l.slice(i + 1).trim() };
  });
const toCsv = (xs?: string[]) => (xs ?? []).join(", ");
const fromCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
/** Drops empty values so an untouched field is not stored as "set to empty". */
function clean<T extends object>(o: T): T | undefined {
  const out = Object.fromEntries(
    Object.entries(o).filter(([, v]) => (Array.isArray(v) ? v.length : v != null && v !== "" && !(typeof v === "object" && !Object.keys(v).length))),
  );
  return Object.keys(out).length ? (out as T) : undefined;
}

function Fieldset({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-line p-4">
      <legend className="px-1 font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}
function Text({ label, value, onChange, rows, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return (
    <label className="block text-sm">
      {label}
      {hint && <span className="ml-1 text-xs text-muted">({hint})</span>}
      {rows ? (
        <textarea className="input mt-1" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
function Chips<T extends string>({ label, map, value, onChange }: { label: string; map: Record<T, string>; value: T[]; onChange: (v: T[]) => void }) {
  return (
    <div className="text-sm">
      <p className="mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(map) as T[]).map((k) => (
          <button
            type="button"
            key={k}
            className="chip"
            data-active={value.includes(k)}
            onClick={() => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k])}
          >
            {map[k]}
          </button>
        ))}
      </div>
    </div>
  );
}
function Suit({ label, value, onChange }: { label: string; value?: Suitability; onChange: (v?: Suitability) => void }) {
  return (
    <label className="text-sm">
      {label}
      <select className="input mt-1" value={value ?? ""} onChange={(e) => onChange((e.target.value || undefined) as Suitability | undefined)}>
        <option value="">—</option>
        {(Object.keys(SUITABILITY_LABELS) as Suitability[]).map((k) => (
          <option key={k} value={k}>
            {SUITABILITY_LABELS[k]}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Pick related poses by name. */
function PoseLinks({ label, ids, onChange, poses, selfId }: { label: string; ids: string[]; onChange: (ids: string[]) => void; poses: Pose[]; selfId: string }) {
  const [q, setQ] = useState("");
  const byName = new Map(poses.map((p) => [p.nameFr.toLowerCase(), p]));
  const byId = new Map(poses.map((p) => [p.id, p]));
  const add = () => {
    const p = byName.get(q.trim().toLowerCase());
    if (p && p.id !== selfId && !ids.includes(p.id)) onChange([...ids, p.id]);
    setQ("");
  };
  const listId = `poses-${label.replace(/\W/g, "")}`;
  return (
    <div className="text-sm">
      <p className="mb-1">{label}</p>
      <div className="mb-1 flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <span key={id} className="chip flex items-center gap-1" data-active>
            {byId.get(id)?.nameFr ?? id}
            <button type="button" aria-label="Retirer" onClick={() => onChange(ids.filter((x) => x !== id))}>
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          list={listId}
          placeholder="Nom de la posture…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button type="button" className="btn" onClick={add}>
          Ajouter
        </button>
      </div>
      <datalist id={listId}>
        {poses.map((p) => (
          <option key={p.id} value={p.nameFr} />
        ))}
      </datalist>
    </div>
  );
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * Keeps only what differs from the catalog pose, so later catalog improvements still show through.
 */
export function diffEdit(base: Pose, next: Pose): PoseEdit {
  const edit: PoseEdit = {};
  for (const k of ["nameFr", "sanskrit", "nameEn", "description", "benefits", "contraindications", "level", "categories", "sided"] as const) {
    if (!same(base[k], next[k])) (edit as Record<string, unknown>)[k] = next[k];
  }
  const details: PoseDetails = {};
  const keys = new Set([...Object.keys(base.details ?? {}), ...Object.keys(next.details ?? {})]) as Set<keyof PoseDetails>;
  for (const k of keys) {
    if (!same(base.details?.[k], next.details?.[k])) (details as Record<string, unknown>)[k] = next.details?.[k] ?? null;
  }
  if (Object.keys(details).length) edit.details = details;
  return edit;
}

export function PoseSheetForm({ pose, poses, onSave, onCancel }: { pose: Pose; poses: Pose[]; onSave: (next: Pose) => void; onCancel: () => void }) {
  const d = pose.details ?? {};
  const [f, setF] = useState({
    nameFr: pose.nameFr,
    sanskrit: pose.sanskrit,
    nameEn: pose.nameEn,
    level: pose.level,
    sided: pose.sided,
    categories: pose.categories,
    description: pose.description,
    benefits: toLines(pose.benefits),
    contraindications: toLines(pose.contraindications),
    summary: d.summary ?? "",
    otherNames: toLines(d.otherNames),
    sanskritIast: d.sanskritIast ?? "",
    pronunciation: d.pronunciation ?? "",
    sanskritMeaning: d.sanskritMeaning ?? "",
    position: d.position ?? "",
    types: d.types ?? [],
    typicalHold: d.typicalHold ?? "",
    entry: toLines(d.steps?.entry),
    hold: toLines(d.steps?.hold),
    exit: toLines(d.steps?.exit),
    cuesShort: toLines(d.cuesShort),
    cuesDetailed: toPairs(d.cuesDetailed?.map((c) => ({ a: c.zone, b: c.cue }))),
    breath: d.breath ?? "",
    commonMistakes: toLines(d.commonMistakes),
    benefitsDetailed: toPairs(d.benefitsDetailed?.map((c) => ({ a: c.theme, b: c.text }))),
    therapeutic: toLines(d.therapeutic),
    stretched: toCsv(d.muscles?.stretched),
    strengthened: toCsv(d.muscles?.strengthened),
    precautions: d.precautions ?? "",
    pregnancy: d.audience?.pregnancy,
    seniors: d.audience?.seniors,
    children: d.audience?.children,
    audienceNote: d.audience?.note ?? "",
    modifications: toLines(d.modifications),
    props: toCsv(d.props),
    preparatory: d.preparatory ?? [],
    counterPoses: d.counterPoses ?? [],
    variations: d.variations ?? [],
    progressions: d.progressions ?? [],
    chakras: d.chakras ?? [],
    doshas: d.doshas ?? [],
    elements: d.elements ?? [],
    gunas: d.gunas ?? [],
    vayus: d.vayus ?? [],
    koshas: d.koshas ?? [],
    meridians: toCsv(d.meridians),
    styles: toCsv(d.styles),
  });
  const set = <K extends keyof typeof f>(k: K) => (v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    const details: PoseDetails = clean({
      summary: f.summary.trim(),
      otherNames: fromLines(f.otherNames),
      sanskritIast: f.sanskritIast.trim(),
      pronunciation: f.pronunciation.trim(),
      sanskritMeaning: f.sanskritMeaning.trim(),
      position: (f.position || undefined) as Position | undefined,
      types: f.types,
      typicalHold: f.typicalHold.trim(),
      steps: clean({ entry: fromLines(f.entry), hold: fromLines(f.hold), exit: fromLines(f.exit) }),
      cuesShort: fromLines(f.cuesShort),
      cuesDetailed: fromPairs(f.cuesDetailed).map(({ a, b }) => ({ zone: a || "Général", cue: b })),
      breath: f.breath.trim(),
      commonMistakes: fromLines(f.commonMistakes),
      benefitsDetailed: fromPairs(f.benefitsDetailed).map(({ a, b }) => ({ theme: a || "Général", text: b })),
      therapeutic: fromLines(f.therapeutic),
      muscles: clean({ stretched: fromCsv(f.stretched), strengthened: fromCsv(f.strengthened) }),
      precautions: f.precautions.trim(),
      audience: clean({ pregnancy: f.pregnancy, seniors: f.seniors, children: f.children, note: f.audienceNote.trim() }),
      modifications: fromLines(f.modifications),
      props: fromCsv(f.props),
      preparatory: f.preparatory,
      counterPoses: f.counterPoses,
      variations: f.variations,
      progressions: f.progressions,
      chakras: f.chakras,
      doshas: f.doshas,
      elements: f.elements,
      gunas: f.gunas,
      vayus: f.vayus,
      koshas: f.koshas,
      meridians: fromCsv(f.meridians),
      styles: fromCsv(f.styles),
    }) ?? {};
    onSave({
      ...pose,
      nameFr: f.nameFr.trim() || pose.nameFr,
      sanskrit: f.sanskrit.trim(),
      nameEn: f.nameEn.trim(),
      level: f.level,
      sided: f.sided,
      categories: f.categories,
      description: f.description.trim(),
      benefits: fromLines(f.benefits),
      contraindications: fromLines(f.contraindications),
      details,
    });
  };

  const others = poses.filter((p) => p.id !== pose.id);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Fieldset title="Identité">
        <div className="grid gap-3 sm:grid-cols-3">
          <Text label="Nom français" value={f.nameFr} onChange={set("nameFr")} />
          <Text label="Nom sanskrit" value={f.sanskrit} onChange={set("sanskrit")} />
          <Text label="Nom anglais" value={f.nameEn} onChange={set("nameEn")} />
          <Text label="Sanskrit avec diacritiques" value={f.sanskritIast} onChange={set("sanskritIast")} />
          <Text label="Prononciation" value={f.pronunciation} onChange={set("pronunciation")} />
          <Text label="Sens du nom" value={f.sanskritMeaning} onChange={set("sanskritMeaning")} />
        </div>
        <Text label="Autres noms" hint="un par ligne" rows={2} value={f.otherNames} onChange={set("otherNames")} />
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Niveau
            <select className="input mt-1" value={f.level} onChange={(e) => set("level")(e.target.value as Level)}>
              {(Object.keys(LEVEL_LABELS) as Level[]).map((l) => (
                <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Position
            <select className="input mt-1" value={f.position} onChange={(e) => set("position")(e.target.value as Position)}>
              <option value="">—</option>
              {(Object.keys(POSITION_LABELS) as Position[]).map((k) => (
                <option key={k} value={k}>{POSITION_LABELS[k]}</option>
              ))}
            </select>
          </label>
          <Text label="Tenue habituelle" value={f.typicalHold} onChange={set("typicalHold")} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.sided} onChange={(e) => set("sided")(e.target.checked)} /> Se pratique des deux côtés
        </label>
        <Chips label="Familles" map={CATEGORY_LABELS} value={f.categories} onChange={(v) => set("categories")(v as Category[])} />
        <Chips label="Type" map={TYPE_LABELS} value={f.types} onChange={set("types")} />
      </Fieldset>

      <Fieldset title="Aperçu">
        <Text label="Aperçu" hint="ce qu'est la posture, ce qu'elle travaille, pour qui" rows={4} value={f.summary} onChange={set("summary")} />
        <Text label="Description courte / placement" rows={2} value={f.description} onChange={set("description")} />
      </Fieldset>

      <Fieldset title="Guidage">
        <Text label="Consignes courtes" hint="une par ligne, prêtes à dire en cours" rows={4} value={f.cuesShort} onChange={set("cuesShort")} />
        <Text label="Consignes détaillées" hint="une par ligne, « Zone : consigne »" rows={6} value={f.cuesDetailed} onChange={set("cuesDetailed")} />
        <Text label="Respiration" rows={2} value={f.breath} onChange={set("breath")} />
        <Text label="Erreurs fréquentes" hint="une par ligne" rows={3} value={f.commonMistakes} onChange={set("commonMistakes")} />
      </Fieldset>

      <Fieldset title="Étapes">
        <Text label="Entrer dans la posture" hint="une étape par ligne" rows={4} value={f.entry} onChange={set("entry")} />
        <Text label="Pendant la tenue" hint="une par ligne" rows={3} value={f.hold} onChange={set("hold")} />
        <Text label="Sortir de la posture" hint="une étape par ligne" rows={3} value={f.exit} onChange={set("exit")} />
      </Fieldset>

      <Fieldset title="Bienfaits">
        <Text label="Bienfaits (liste courte)" hint="un par ligne" rows={3} value={f.benefits} onChange={set("benefits")} />
        <Text label="Bienfaits détaillés" hint="un par ligne, « Thème : texte »" rows={5} value={f.benefitsDetailed} onChange={set("benefitsDetailed")} />
        <Text label="En accompagnement de" hint="un par ligne, formulé prudemment" rows={3} value={f.therapeutic} onChange={set("therapeutic")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Text label="Muscles étirés" hint="séparés par des virgules" value={f.stretched} onChange={set("stretched")} />
          <Text label="Muscles renforcés" hint="séparés par des virgules" value={f.strengthened} onChange={set("strengthened")} />
        </div>
      </Fieldset>

      <Fieldset title="Précautions et public">
        <Text label="Contre-indications (liste courte)" hint="une par ligne" rows={3} value={f.contraindications} onChange={set("contraindications")} />
        <Text label="Précautions détaillées" rows={3} value={f.precautions} onChange={set("precautions")} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Suit label="Grossesse" value={f.pregnancy} onChange={set("pregnancy")} />
          <Suit label="Seniors" value={f.seniors} onChange={set("seniors")} />
          <Suit label="Enfants" value={f.children} onChange={set("children")} />
        </div>
        <Text label="Remarque sur le public" value={f.audienceNote} onChange={set("audienceNote")} />
      </Fieldset>

      <Fieldset title="Adaptations">
        <Text label="Adaptations" hint="une par ligne" rows={3} value={f.modifications} onChange={set("modifications")} />
        <Text label="Accessoires" hint="séparés par des virgules" value={f.props} onChange={set("props")} />
      </Fieldset>

      <Fieldset title="Postures liées">
        <PoseLinks label="Pour préparer" ids={f.preparatory} onChange={set("preparatory")} poses={others} selfId={pose.id} />
        <PoseLinks label="Pour compenser / relâcher" ids={f.counterPoses} onChange={set("counterPoses")} poses={others} selfId={pose.id} />
        <PoseLinks label="Variantes" ids={f.variations} onChange={set("variations")} poses={others} selfId={pose.id} />
        <PoseLinks label="Pour progresser" ids={f.progressions} onChange={set("progressions")} poses={others} selfId={pose.id} />
      </Fieldset>

      <Fieldset title="Repères traditionnels">
        <Chips label="Chakras" map={CHAKRA_LABELS} value={f.chakras} onChange={set("chakras")} />
        <Chips label="Doshas" map={DOSHA_LABELS} value={f.doshas} onChange={set("doshas")} />
        <Chips label="Éléments" map={ELEMENT_LABELS} value={f.elements} onChange={set("elements")} />
        <Chips label="Gunas" map={GUNA_LABELS} value={f.gunas} onChange={set("gunas")} />
        <Chips label="Vayus" map={VAYU_LABELS} value={f.vayus} onChange={set("vayus")} />
        <Chips label="Koshas" map={KOSHA_LABELS} value={f.koshas} onChange={set("koshas")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Text label="Méridiens" hint="séparés par des virgules" value={f.meridians} onChange={set("meridians")} />
          <Text label="Styles de yoga" hint="séparés par des virgules" value={f.styles} onChange={set("styles")} />
        </div>
      </Fieldset>

      <div className="sticky bottom-0 flex gap-2 border-t border-line bg-background py-3">
        <button type="submit" className="btn-primary">
          Enregistrer la fiche
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
