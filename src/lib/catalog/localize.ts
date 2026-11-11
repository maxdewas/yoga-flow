/**
 * Builds the catalogue in one language: the hand-written poses (French source + translations)
 * and Éléonore's imported poses (coded facts → texts rendered here), linked to their base pose.
 */
import type { PoseDetails } from "../details";
import type { Locale } from "../locale";
import { LABELS, type Labels } from "../labels";
import type { Category, Pose } from "../types";
import { DETAILS } from "./details";
import { FAMILIES } from "./families";
import { FIGURES } from "./figures";
import { englishName, ENRICH, IMPORTED, IMPORTED_NAMES_FR, type ImportedFacts } from "./imported";
import { POSE_IMAGES } from "./pose-images";

/** Original texts written per base pose of the imported catalogue (keyed by base pose id). */
export interface FamilyText {
  name?: string;
  summary?: string;
  benefits?: string[];
  contraindications?: string[];
  steps?: { entry?: string[]; hold?: string[]; exit?: string[] };
  breath?: string;
}

/** Everything that changes with the language, loaded on demand (src/lib/catalog/locales/<locale>.json). */
export interface LocaleContent {
  /** Imported pose names (French ones live in imported/names-fr.json). */
  names: Record<string, string>;
  families: Record<string, FamilyText>;
  /** Translations of the hand-written poses (not used for French, their source language). */
  existing: Record<string, { name?: string; description?: string; benefits?: string[]; contraindications?: string[] }>;
  details: Record<string, PoseDetails>;
}

export const EMPTY_CONTENT: LocaleContent = { names: {}, families: {}, existing: {}, details: {} };

const T = {
  fr: {
    variantOf: "Variante de « {base} »",
    pose: "Posture",
    focus: "axée sur {types}",
    works: "Sollicite surtout : {zones}.",
    stretch: "Étire {zones}",
    stretchAny: "Assouplit le corps",
    strength: "Renforce {zones}",
    strengthAny: "Renforce le corps",
    and: " et ",
    fixed: {
      equilibre: "Développe l'équilibre et la concentration",
      relaxation: "Favorise la détente",
      respiration: "Approfondit et régule le souffle",
      meditation: "Apaise le mental",
      mobilite: "Entretient la mobilité",
      torsion: "Mobilise la colonne en rotation",
      "flexion-avant": "Allonge l'arrière du corps",
      "flexion-arriere": "Ouvre l'avant du corps",
      inversion: "Offre un retournement doux du corps",
      "ouverture-hanches": "Ouvre les hanches",
      gainage: "Tonifie le centre du corps",
      "flexion-laterale": "Étire les flancs",
    } as Record<string, string>,
    fallback: "Enrichit la pratique",
  },
  en: {
    variantOf: "Variation of “{base}”",
    pose: "Pose",
    focus: "focused on {types}",
    works: "Mainly works: {zones}.",
    stretch: "Stretches {zones}",
    stretchAny: "Improves flexibility",
    strength: "Strengthens {zones}",
    strengthAny: "Builds strength",
    and: " and ",
    fixed: {
      equilibre: "Develops balance and focus",
      relaxation: "Encourages relaxation",
      respiration: "Deepens and steadies the breath",
      meditation: "Calms the mind",
      mobilite: "Maintains mobility",
      torsion: "Mobilises the spine in rotation",
      "flexion-avant": "Lengthens the back of the body",
      "flexion-arriere": "Opens the front of the body",
      inversion: "Gently turns the body upside down",
      "ouverture-hanches": "Opens the hips",
      gainage: "Tones the core",
      "flexion-laterale": "Stretches the sides",
    } as Record<string, string>,
    fallback: "Enriches the practice",
  },
  es: {
    variantOf: "Variante de «{base}»",
    pose: "Postura",
    focus: "centrada en {types}",
    works: "Trabaja sobre todo: {zones}.",
    stretch: "Estira {zones}",
    stretchAny: "Aporta flexibilidad",
    strength: "Fortalece {zones}",
    strengthAny: "Fortalece el cuerpo",
    and: " y ",
    fixed: {
      equilibre: "Desarrolla el equilibrio y la concentración",
      relaxation: "Favorece la relajación",
      respiration: "Profundiza y regula la respiración",
      meditation: "Calma la mente",
      mobilite: "Mantiene la movilidad",
      torsion: "Moviliza la columna en rotación",
      "flexion-avant": "Alarga la parte posterior del cuerpo",
      "flexion-arriere": "Abre la parte frontal del cuerpo",
      inversion: "Invierte suavemente el cuerpo",
      "ouverture-hanches": "Abre las caderas",
      gainage: "Tonifica el centro del cuerpo",
      "flexion-laterale": "Estira los costados",
    } as Record<string, string>,
    fallback: "Enriquece la práctica",
  },
} satisfies Record<Locale, unknown>;

const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function zonesText(f: ImportedFacts, L: Labels, and: string, max = 2) {
  const z = f.zones.slice(0, max).map((c) => lower(L.zone[c] ?? c));
  return z.length > 1 ? `${z.slice(0, -1).join(", ")}${and}${z[z.length - 1]}` : (z[0] ?? "");
}

function generatedBenefits(f: ImportedFacts, locale: Locale): string[] {
  const t = T[locale];
  const L = LABELS[locale];
  const out: string[] = [];
  const zones = zonesText(f, L, t.and);
  if (f.types.includes("etirement")) out.push(zones ? fill(t.stretch, { zones }) : t.stretchAny);
  if (f.types.includes("renforcement")) out.push(zones ? fill(t.strength, { zones }) : t.strengthAny);
  for (const k of [...f.types, ...f.shapes, ...f.categories]) if (t.fixed[k] && !out.includes(t.fixed[k])) out.push(t.fixed[k]);
  return out.length ? out.slice(0, 4) : [t.fallback];
}

function generatedDescription(f: ImportedFacts, locale: Locale, baseName: string | undefined): string {
  const t = T[locale];
  const L = LABELS[locale];
  const head = baseName ? fill(t.variantOf, { base: baseName }) : t.pose;
  const parts = [head];
  if (f.position) parts.push(lower(L.position[f.position]));
  const types = f.types.filter((x) => x !== "equilibre" || !f.categories.includes("equilibre"));
  if (types.length) parts.push(fill(t.focus, { types: types.map((x) => lower(L.type[x])).join(t.and) }));
  const zones = zonesText(f, L, t.and, 4);
  return `${parts.join(", ")}.${zones ? ` ${fill(t.works, { zones })}` : ""}`;
}

/** Catalogue details carried by the imported facts, labelled in the given language. */
function factDetails(f: ImportedFacts, locale: Locale): PoseDetails {
  const L = LABELS[locale];
  const d: PoseDetails = {
    position: f.position,
    types: f.types.length ? f.types : undefined,
    bodyPositions: f.bodyPositions,
    zones: f.zones,
    shapes: f.shapes,
    audiences: f.audiences,
    therapeutic: f.therapeutic.map((c) => L.therapeutic[c] ?? c),
    equipment: f.props,
    tags: f.tags,
    chakras: f.chakras,
    gunas: f.gunas,
    vayus: f.vayus,
    koshas: f.koshas,
    meridians: f.meridians.map((c) => L.meridian[c] ?? c),
    styles: f.styles,
    popularityRank: f.popularityRank,
    oftenBefore: f.before,
    oftenAfter: f.after,
  };
  if (f.audiences.length) {
    d.audience = {
      ...(f.audiences.includes("prenatal") && { pregnancy: "oui" as const }),
      ...(f.audiences.includes("seniors") && { seniors: "oui" as const }),
      ...(f.audiences.includes("enfants") && { children: "oui" as const }),
    };
  }
  return Object.fromEntries(
    Object.entries(d).filter(([, v]) => v != null && !(Array.isArray(v) && v.length === 0) && !(typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length)),
  ) as PoseDetails;
}

/** Text fields of a family sheet as details. */
const familyDetails = (t: FamilyText | undefined): PoseDetails =>
  t ? { summary: t.summary || undefined, steps: t.steps, breath: t.breath || undefined } : {};

/** Fills only what the base sheet leaves empty: hand-written content always wins. */
function fillGaps(base: PoseDetails | undefined, extra: PoseDetails): PoseDetails {
  const out: PoseDetails = { ...base };
  for (const [k, v] of Object.entries(extra) as [keyof PoseDetails, unknown][]) {
    const cur = out[k];
    const empty = cur == null || cur === "" || (Array.isArray(cur) && cur.length === 0);
    if (empty && v != null) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

const cache = new Map<string, { content: LocaleContent; poses: Pose[] }>();

export function buildCatalog(locale: Locale, content: LocaleContent): Pose[] {
  const hit = cache.get(locale);
  if (hit && hit.content === content) return hit.poses;

  // 1. Hand-written catalogue, translated when not French.
  const curated: Pose[] = Object.entries(FAMILIES).flatMap(([family, poses]) =>
    poses.map((pose) => {
      const tr = locale === "fr" ? undefined : content.existing[pose.id];
      const details = (locale !== "fr" && content.details[pose.id]) || DETAILS[pose.id];
      const enrich = ENRICH[pose.id];
      const merged = fillGaps(fillGaps(details, familyDetails(content.families[pose.id])), enrich ? factDetails(enrich, locale) : {});
      return {
        ...pose,
        name: tr?.name || (locale === "en" ? pose.nameEn : "") || pose.nameFr,
        description: tr?.description || pose.description,
        benefits: tr?.benefits?.length ? tr.benefits : pose.benefits,
        contraindications: tr?.contraindications ?? pose.contraindications,
        family,
        ...(Object.keys(merged).length && { details: merged }),
        ...(POSE_IMAGES[pose.id] && { image: POSE_IMAGES[pose.id] }),
        ...(FIGURES[pose.id] && { figure: FIGURES[pose.id] }),
      };
    }),
  );
  const byId = new Map(curated.map((p) => [p.id, p]));

  // 2. Imported poses. Names first, so variations can quote their base pose.
  const nameOf = (f: ImportedFacts) =>
    (locale === "fr" ? IMPORTED_NAMES_FR[f.id] : locale === "es" ? content.names[f.id] : undefined) ||
    content.families[f.id]?.name ||
    englishName(f.en);
  const names = new Map(IMPORTED.map((f) => [f.id, nameOf(f)]));
  const textOf = (id: string): FamilyText | undefined => content.families[id];

  const imported: Pose[] = IMPORTED.map((f) => {
    const baseName = f.variantOf ? (names.get(f.variantOf) ?? byId.get(f.variantOf)?.name) : undefined;
    const own = textOf(f.id);
    const baseText = f.variantOf ? textOf(f.variantOf) : undefined;
    const baseCurated = f.variantOf ? byId.get(f.variantOf) : undefined;
    const contraindications = own?.contraindications ?? baseText?.contraindications ?? baseCurated?.contraindications ?? [];
    const details = fillGaps(familyDetails(own), factDetails(f, locale));
    return {
      id: f.id,
      name: names.get(f.id)!,
      nameFr: IMPORTED_NAMES_FR[f.id] || englishName(f.en),
      nameEn: englishName(f.en),
      sanskrit: f.sanskrit,
      categories: (f.categories.length ? f.categories : ["debout"]) as Category[],
      level: f.level ?? "debutant",
      sided: f.sided ?? false,
      description: own?.summary || generatedDescription(f, locale, baseName),
      benefits: own?.benefits?.length ? own.benefits : generatedBenefits(f, locale),
      contraindications,
      family: f.family ?? "debout",
      details,
      imported: true,
      ...(f.variantOf && { variantOf: f.variantOf }),
      ...(POSE_IMAGES[f.id] && { image: POSE_IMAGES[f.id] }),
    };
  });

  // 3. Variation links, from each variation to its base.
  const all = [...curated, ...imported];
  const variants = new Map<string, string[]>();
  for (const p of imported) if (p.variantOf) variants.set(p.variantOf, [...(variants.get(p.variantOf) ?? []), p.id]);
  const poses = all.map((p) => (variants.has(p.id) ? { ...p, variants: variants.get(p.id) } : p));
  cache.set(locale, { content, poses });
  return poses;
}
