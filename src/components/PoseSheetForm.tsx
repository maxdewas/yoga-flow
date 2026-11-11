"use client";

import { useState, type ReactNode } from "react";
import type { PoseDetails, Position, Suitability } from "@/lib/details";
import { useLabels, useMessages } from "@/lib/i18n";
import type { PoseEdit } from "@/lib/store";
import type { Category, Level, Pose } from "@/lib/types";

const M = {
  fr: {
    remove: "Retirer",
    posePlaceholder: "Nom de la posture…",
    add: "Ajouter",
    general: "Général",
    identity: "Identité",
    name: "Nom",
    sanskrit: "Nom sanskrit",
    english: "Nom anglais",
    iast: "Sanskrit avec diacritiques",
    pronunciation: "Prononciation",
    meaning: "Sens du nom",
    otherNames: "Autres noms",
    level: "Niveau",
    position: "Position",
    typicalHold: "Tenue habituelle",
    sided: "Se pratique des deux côtés",
    families: "Familles",
    type: "Type",
    overview: "Aperçu",
    overviewHint: "ce qu'est la posture, ce qu'elle travaille, pour qui",
    description: "Description courte / placement",
    guidance: "Guidage",
    cuesShort: "Consignes courtes",
    cuesShortHint: "une par ligne, prêtes à dire en cours",
    cuesDetailed: "Consignes détaillées",
    cuesDetailedHint: "une par ligne, « Zone : consigne »",
    breath: "Respiration",
    mistakes: "Erreurs fréquentes",
    steps: "Étapes",
    entry: "Entrer dans la posture",
    hold: "Pendant la tenue",
    exit: "Sortir de la posture",
    benefits: "Bienfaits",
    benefitsShort: "Bienfaits (liste courte)",
    benefitsDetailed: "Bienfaits détaillés",
    benefitsDetailedHint: "un par ligne, « Thème : texte »",
    therapeutic: "En accompagnement de",
    therapeuticHint: "un par ligne, formulé prudemment",
    stretched: "Muscles étirés",
    strengthened: "Muscles renforcés",
    precautionsAudience: "Précautions et public",
    contraShort: "Contre-indications (liste courte)",
    precautions: "Précautions détaillées",
    pregnancy: "Grossesse",
    seniors: "Seniors",
    children: "Enfants",
    audienceNote: "Remarque sur le public",
    modifications: "Adaptations",
    props: "Accessoires",
    related: "Postures liées",
    preparatory: "Pour préparer",
    counterPoses: "Pour compenser / relâcher",
    variations: "Variantes",
    progressions: "Pour progresser",
    traditional: "Repères traditionnels",
    chakras: "Chakras",
    doshas: "Doshas",
    elements: "Éléments",
    gunas: "Gunas",
    vayus: "Vayus",
    koshas: "Koshas",
    meridians: "Méridiens",
    styles: "Styles de yoga",
    save: "Enregistrer la fiche",
    cancel: "Annuler",
    perLineM: "un par ligne",
    perLineF: "une par ligne",
    stepPerLine: "une étape par ligne",
    commaSeparated: "séparés par des virgules",
  },
  en: {
    remove: "Remove",
    posePlaceholder: "Pose name…",
    add: "Add",
    general: "General",
    identity: "Identity",
    name: "Name",
    sanskrit: "Sanskrit name",
    english: "English name",
    iast: "Sanskrit with diacritics",
    pronunciation: "Pronunciation",
    meaning: "Meaning of the name",
    otherNames: "Other names",
    level: "Level",
    position: "Position",
    typicalHold: "Typical hold",
    sided: "Practiced on both sides",
    families: "Families",
    type: "Type",
    overview: "Overview",
    overviewHint: "what the pose is, what it works, who it's for",
    description: "Short description / alignment",
    guidance: "Guidance",
    cuesShort: "Short cues",
    cuesShortHint: "one per line, ready to say in class",
    cuesDetailed: "Detailed cues",
    cuesDetailedHint: "one per line, “Area: cue”",
    breath: "Breath",
    mistakes: "Common mistakes",
    steps: "Steps",
    entry: "Entering the pose",
    hold: "During the hold",
    exit: "Coming out of the pose",
    benefits: "Benefits",
    benefitsShort: "Benefits (short list)",
    benefitsDetailed: "Detailed benefits",
    benefitsDetailedHint: "one per line, “Theme: text”",
    therapeutic: "Supportive for",
    therapeuticHint: "one per line, worded carefully",
    stretched: "Muscles stretched",
    strengthened: "Muscles strengthened",
    precautionsAudience: "Precautions and audience",
    contraShort: "Contraindications (short list)",
    precautions: "Detailed precautions",
    pregnancy: "Pregnancy",
    seniors: "Seniors",
    children: "Children",
    audienceNote: "Note on the audience",
    modifications: "Modifications",
    props: "Props",
    related: "Related poses",
    preparatory: "To prepare",
    counterPoses: "To counter / release",
    variations: "Variations",
    progressions: "To progress",
    traditional: "Traditional references",
    chakras: "Chakras",
    doshas: "Doshas",
    elements: "Elements",
    gunas: "Gunas",
    vayus: "Vayus",
    koshas: "Koshas",
    meridians: "Meridians",
    styles: "Yoga styles",
    save: "Save pose sheet",
    cancel: "Cancel",
    perLineM: "one per line",
    perLineF: "one per line",
    stepPerLine: "one step per line",
    commaSeparated: "comma-separated",
  },
  es: {
    remove: "Quitar",
    posePlaceholder: "Nombre de la postura…",
    add: "Añadir",
    general: "General",
    identity: "Identidad",
    name: "Nombre",
    sanskrit: "Nombre en sánscrito",
    english: "Nombre en inglés",
    iast: "Sánscrito con diacríticos",
    pronunciation: "Pronunciación",
    meaning: "Significado del nombre",
    otherNames: "Otros nombres",
    level: "Nivel",
    position: "Posición",
    typicalHold: "Permanencia habitual",
    sided: "Se practica en ambos lados",
    families: "Familias",
    type: "Tipo",
    overview: "Resumen",
    overviewHint: "qué es la postura, qué trabaja, para quién",
    description: "Descripción breve / alineación",
    guidance: "Guía",
    cuesShort: "Indicaciones breves",
    cuesShortHint: "una por línea, listas para decir en clase",
    cuesDetailed: "Indicaciones detalladas",
    cuesDetailedHint: "una por línea, «Zona: indicación»",
    breath: "Respiración",
    mistakes: "Errores frecuentes",
    steps: "Pasos",
    entry: "Entrar en la postura",
    hold: "Durante la permanencia",
    exit: "Salir de la postura",
    benefits: "Beneficios",
    benefitsShort: "Beneficios (lista breve)",
    benefitsDetailed: "Beneficios detallados",
    benefitsDetailedHint: "uno por línea, «Tema: texto»",
    therapeutic: "Como apoyo en",
    therapeuticHint: "uno por línea, formulado con prudencia",
    stretched: "Músculos estirados",
    strengthened: "Músculos fortalecidos",
    precautionsAudience: "Precauciones y público",
    contraShort: "Contraindicaciones (lista breve)",
    precautions: "Precauciones detalladas",
    pregnancy: "Embarazo",
    seniors: "Personas mayores",
    children: "Niños",
    audienceNote: "Nota sobre el público",
    modifications: "Adaptaciones",
    props: "Accesorios",
    related: "Posturas relacionadas",
    preparatory: "Para preparar",
    counterPoses: "Para compensar / soltar",
    variations: "Variantes",
    progressions: "Para progresar",
    traditional: "Referencias tradicionales",
    chakras: "Chakras",
    doshas: "Doshas",
    elements: "Elementos",
    gunas: "Gunas",
    vayus: "Vayus",
    koshas: "Koshas",
    meridians: "Meridianos",
    styles: "Estilos de yoga",
    save: "Guardar la ficha",
    cancel: "Cancelar",
    perLineM: "uno por línea",
    perLineF: "una por línea",
    stepPerLine: "un paso por línea",
    commaSeparated: "separados por comas",
  },
};

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
  const L = useLabels();
  return (
    <label className="text-sm">
      {label}
      <select className="input mt-1" value={value ?? ""} onChange={(e) => onChange((e.target.value || undefined) as Suitability | undefined)}>
        <option value="">—</option>
        {(Object.keys(L.suitability) as Suitability[]).map((k) => (
          <option key={k} value={k}>
            {L.suitability[k]}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Pick related poses by name. */
function PoseLinks({ label, ids, onChange, poses, selfId }: { label: string; ids: string[]; onChange: (ids: string[]) => void; poses: Pose[]; selfId: string }) {
  const t = useMessages(M);
  const [q, setQ] = useState("");
  const byName = new Map(poses.map((p) => [p.name.toLowerCase(), p]));
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
            {byId.get(id)?.name ?? id}
            <button type="button" aria-label={t.remove} onClick={() => onChange(ids.filter((x) => x !== id))}>
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          list={listId}
          placeholder={t.posePlaceholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button type="button" className="btn" onClick={add}>
          {t.add}
        </button>
      </div>
      <datalist id={listId}>
        {poses.map((p) => (
          <option key={p.id} value={p.name} />
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
  const t = useMessages(M);
  const L = useLabels();
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
      cuesDetailed: fromPairs(f.cuesDetailed).map(({ a, b }) => ({ zone: a || t.general, cue: b })),
      breath: f.breath.trim(),
      commonMistakes: fromLines(f.commonMistakes),
      benefitsDetailed: fromPairs(f.benefitsDetailed).map(({ a, b }) => ({ theme: a || t.general, text: b })),
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
      <Fieldset title={t.identity}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Text label={t.name} value={f.nameFr} onChange={set("nameFr")} />
          <Text label={t.sanskrit} value={f.sanskrit} onChange={set("sanskrit")} />
          <Text label={t.english} value={f.nameEn} onChange={set("nameEn")} />
          <Text label={t.iast} value={f.sanskritIast} onChange={set("sanskritIast")} />
          <Text label={t.pronunciation} value={f.pronunciation} onChange={set("pronunciation")} />
          <Text label={t.meaning} value={f.sanskritMeaning} onChange={set("sanskritMeaning")} />
        </div>
        <Text label={t.otherNames} hint={t.perLineM} rows={2} value={f.otherNames} onChange={set("otherNames")} />
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            {t.level}
            <select className="input mt-1" value={f.level} onChange={(e) => set("level")(e.target.value as Level)}>
              {(Object.keys(L.level) as Level[]).map((l) => (
                <option key={l} value={l}>{L.level[l]}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            {t.position}
            <select className="input mt-1" value={f.position} onChange={(e) => set("position")(e.target.value as Position)}>
              <option value="">—</option>
              {(Object.keys(L.position) as Position[]).map((k) => (
                <option key={k} value={k}>{L.position[k]}</option>
              ))}
            </select>
          </label>
          <Text label={t.typicalHold} value={f.typicalHold} onChange={set("typicalHold")} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.sided} onChange={(e) => set("sided")(e.target.checked)} /> {t.sided}
        </label>
        <Chips label={t.families} map={L.category} value={f.categories} onChange={(v) => set("categories")(v as Category[])} />
        <Chips label={t.type} map={L.type} value={f.types} onChange={set("types")} />
      </Fieldset>

      <Fieldset title={t.overview}>
        <Text label={t.overview} hint={t.overviewHint} rows={4} value={f.summary} onChange={set("summary")} />
        <Text label={t.description} rows={2} value={f.description} onChange={set("description")} />
      </Fieldset>

      <Fieldset title={t.guidance}>
        <Text label={t.cuesShort} hint={t.cuesShortHint} rows={4} value={f.cuesShort} onChange={set("cuesShort")} />
        <Text label={t.cuesDetailed} hint={t.cuesDetailedHint} rows={6} value={f.cuesDetailed} onChange={set("cuesDetailed")} />
        <Text label={t.breath} rows={2} value={f.breath} onChange={set("breath")} />
        <Text label={t.mistakes} hint={t.perLineF} rows={3} value={f.commonMistakes} onChange={set("commonMistakes")} />
      </Fieldset>

      <Fieldset title={t.steps}>
        <Text label={t.entry} hint={t.stepPerLine} rows={4} value={f.entry} onChange={set("entry")} />
        <Text label={t.hold} hint={t.perLineF} rows={3} value={f.hold} onChange={set("hold")} />
        <Text label={t.exit} hint={t.stepPerLine} rows={3} value={f.exit} onChange={set("exit")} />
      </Fieldset>

      <Fieldset title={t.benefits}>
        <Text label={t.benefitsShort} hint={t.perLineM} rows={3} value={f.benefits} onChange={set("benefits")} />
        <Text label={t.benefitsDetailed} hint={t.benefitsDetailedHint} rows={5} value={f.benefitsDetailed} onChange={set("benefitsDetailed")} />
        <Text label={t.therapeutic} hint={t.therapeuticHint} rows={3} value={f.therapeutic} onChange={set("therapeutic")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Text label={t.stretched} hint={t.commaSeparated} value={f.stretched} onChange={set("stretched")} />
          <Text label={t.strengthened} hint={t.commaSeparated} value={f.strengthened} onChange={set("strengthened")} />
        </div>
      </Fieldset>

      <Fieldset title={t.precautionsAudience}>
        <Text label={t.contraShort} hint={t.perLineF} rows={3} value={f.contraindications} onChange={set("contraindications")} />
        <Text label={t.precautions} rows={3} value={f.precautions} onChange={set("precautions")} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Suit label={t.pregnancy} value={f.pregnancy} onChange={set("pregnancy")} />
          <Suit label={t.seniors} value={f.seniors} onChange={set("seniors")} />
          <Suit label={t.children} value={f.children} onChange={set("children")} />
        </div>
        <Text label={t.audienceNote} value={f.audienceNote} onChange={set("audienceNote")} />
      </Fieldset>

      <Fieldset title={t.modifications}>
        <Text label={t.modifications} hint={t.perLineF} rows={3} value={f.modifications} onChange={set("modifications")} />
        <Text label={t.props} hint={t.commaSeparated} value={f.props} onChange={set("props")} />
      </Fieldset>

      <Fieldset title={t.related}>
        <PoseLinks label={t.preparatory} ids={f.preparatory} onChange={set("preparatory")} poses={others} selfId={pose.id} />
        <PoseLinks label={t.counterPoses} ids={f.counterPoses} onChange={set("counterPoses")} poses={others} selfId={pose.id} />
        <PoseLinks label={t.variations} ids={f.variations} onChange={set("variations")} poses={others} selfId={pose.id} />
        <PoseLinks label={t.progressions} ids={f.progressions} onChange={set("progressions")} poses={others} selfId={pose.id} />
      </Fieldset>

      <Fieldset title={t.traditional}>
        <Chips label={t.chakras} map={L.chakra} value={f.chakras} onChange={set("chakras")} />
        <Chips label={t.doshas} map={L.dosha} value={f.doshas} onChange={set("doshas")} />
        <Chips label={t.elements} map={L.element} value={f.elements} onChange={set("elements")} />
        <Chips label={t.gunas} map={L.guna} value={f.gunas} onChange={set("gunas")} />
        <Chips label={t.vayus} map={L.vayu} value={f.vayus} onChange={set("vayus")} />
        <Chips label={t.koshas} map={L.kosha} value={f.koshas} onChange={set("koshas")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Text label={t.meridians} hint={t.commaSeparated} value={f.meridians} onChange={set("meridians")} />
          <Text label={t.styles} hint={t.commaSeparated} value={f.styles} onChange={set("styles")} />
        </div>
      </Fieldset>

      <div className="sticky bottom-0 flex gap-2 border-t border-line bg-background py-3">
        <button type="submit" className="btn-primary">
          {t.save}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
