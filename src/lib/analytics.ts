import type { Chakra } from "./details";
import { itemSeconds } from "./duration";
import type { AnalyticsZone } from "./labels";
import type { Localized } from "./locale";
import type { Category, ClassPlan, Level, Pose, SequenceItem } from "./types";

/**
 * Analyse d'un cours : tout est calculé à partir des postures du catalogue (niveau, familles, fiche).
 * Les zones et chakras sont des estimations déduites des familles de postures, pas des mesures.
 */

export const LEVEL_RANK: Record<Level, number> = { debutant: 1, intermediaire: 2, avance: 3 };

const CATEGORY_EFFORT: Partial<Record<Category, number>> = {
  "equilibre-bras": 2,
  inversion: 1.4,
  gainage: 1.4,
  "flexion-arriere": 0.9,
  equilibre: 0.9,
  debout: 0.5,
  torsion: 0.2,
  allongee: -0.5,
  assise: -0.3,
  restauratrice: -1.5,
};

/** Intensité perçue d'une posture, de 1 (repos) à 5 (très exigeante). */
export function poseIntensity(pose: Pose | undefined): number {
  if (!pose) return 1;
  const effort = pose.categories.reduce((sum, c) => sum + (CATEGORY_EFFORT[c] ?? 0), 0);
  return Math.min(5, Math.max(1, LEVEL_RANK[pose.level] + effort));
}

/** Body areas of the analysis; labels live in `LABELS[locale].analyticsZone`. */
export type Zone = AnalyticsZone;

/** Every zone, in display order (front to back, top to bottom). */
export const ZONES: Zone[] = ["epaules", "bras", "poitrine", "abdos", "dos", "hanches", "fessiers", "ischios", "cuisses", "mollets"];

const CATEGORY_ZONES: Partial<Record<Category, Partial<Record<Zone, number>>>> = {
  debout: { cuisses: 1, fessiers: 0.6, mollets: 0.5 },
  equilibre: { mollets: 1, cuisses: 0.8, abdos: 0.6, fessiers: 0.5 },
  "flexion-avant": { ischios: 1, dos: 0.6, mollets: 0.4 },
  "flexion-arriere": { dos: 1, poitrine: 0.9, epaules: 0.6, hanches: 0.5 },
  torsion: { dos: 0.9, abdos: 0.8 },
  inversion: { epaules: 1, bras: 0.6, abdos: 0.6 },
  "ouverture-hanches": { hanches: 1, fessiers: 0.8, cuisses: 0.3 },
  gainage: { abdos: 1, epaules: 0.6, bras: 0.6 },
  "equilibre-bras": { bras: 1, epaules: 0.8, abdos: 0.8 },
};

export const CHAKRA_ORDER: Chakra[] = ["racine", "sacre", "plexus", "coeur", "gorge", "troisieme-oeil", "couronne"];

export const CHAKRA_COLORS: Record<Chakra, string> = {
  racine: "#d9534f",
  sacre: "#ec8a3b",
  plexus: "#e9c13b",
  coeur: "#5aa469",
  gorge: "#4a9fd8",
  "troisieme-oeil": "#5c5fc4",
  couronne: "#9a6cc7",
};

/** Short chakra names for compact charts; full names are `LABELS[locale].chakra`. */
export const CHAKRA_SHORT: Localized<Record<Chakra, string>> = {
  fr: { racine: "Racine", sacre: "Sacré", plexus: "Plexus", coeur: "Cœur", gorge: "Gorge", "troisieme-oeil": "3e œil", couronne: "Couronne" },
  en: { racine: "Root", sacre: "Sacral", plexus: "Plexus", coeur: "Heart", gorge: "Throat", "troisieme-oeil": "3rd eye", couronne: "Crown" },
  es: { racine: "Raíz", sacre: "Sacro", plexus: "Plexo", coeur: "Corazón", gorge: "Garganta", "troisieme-oeil": "3.er ojo", couronne: "Corona" },
};

const THROAT_POSES = /^(chandelle|charrue|poisson|oreilles-pressees|pont|lion|demi-chandelle|embryon-chandelle)/;

/** Repères traditionnels : la fiche de la posture d'abord, sinon une association usuelle selon sa famille. */
export function poseChakras(pose: Pose): Chakra[] {
  if (pose.details?.chakras?.length) return pose.details.chakras;
  if (pose.id.startsWith("med-") || pose.id.startsWith("mudra-")) return ["troisieme-oeil", "couronne"];
  if (pose.id.startsWith("resp-")) return ["gorge"];
  if (THROAT_POSES.test(pose.id)) return ["gorge"];
  const has = (c: Category) => pose.categories.includes(c);
  if (has("inversion")) return ["couronne"];
  if (has("flexion-arriere")) return ["coeur"];
  if (has("torsion") || has("gainage") || has("equilibre-bras")) return ["plexus"];
  if (has("ouverture-hanches")) return ["sacre"];
  if (has("restauratrice")) return ["couronne"];
  if (has("debout") || has("equilibre")) return ["racine"];
  if (has("flexion-avant")) return ["sacre"];
  return ["racine"];
}

export interface FlowEntry {
  item: SequenceItem;
  pose: Pose | undefined;
  sectionId: string;
  /** Position dans tout le cours, à partir de 0. */
  index: number;
  start: number;
  seconds: number;
}

export function flowEntries(plan: Pick<ClassPlan, "sections">, poseMap: Map<string, Pose>): FlowEntry[] {
  const out: FlowEntry[] = [];
  let t = 0;
  for (const section of plan.sections)
    for (const item of section.items) {
      const seconds = itemSeconds(item);
      out.push({ item, pose: poseMap.get(item.poseId), sectionId: section.id, index: out.length, start: t, seconds });
      t += seconds;
    }
  return out;
}

/** A finding about the class; its wording belongs to the display (see AnalyticsPanel). */
export type Insight = {
  tone: "ok" | "warn";
  /** Postures concernées (ids d'éléments du cours), pour les surligner. */
  itemIds?: string[];
} & (
  | { kind: "unmatched-sides"; pose: Pose; right: number; left: number }
  | { kind: "above-level"; count: number }
  | { kind: "intense-start" }
  | { kind: "no-rest-end" }
  | { kind: "over-target"; minutes: number }
  | { kind: "under-target"; minutes: number }
  | { kind: "balanced" }
);

export interface FlowAnalysis {
  count: number;
  total: number;
  avgLevel: number;
  peak: FlowEntry | undefined;
  curve: { start: number; seconds: number; intensity: number; itemId: string }[];
  levels: { level: Level; seconds: number; count: number }[];
  sides: { left: number; right: number; both: number; none: number };
  unmatched: { pose: Pose; right: number; left: number; itemIds: string[] }[];
  categories: { category: Category; seconds: number }[];
  zones: { zone: Zone; score: number }[];
  chakras: { chakra: Chakra; seconds: number }[];
  insights: Insight[];
}

export function analyzeFlow(plan: Pick<ClassPlan, "sections" | "level" | "targetMinutes">, poseMap: Map<string, Pose>): FlowAnalysis {
  const entries = flowEntries(plan, poseMap);
  const total = entries.reduce((n, e) => n + e.seconds, 0);
  const known = entries.filter((e): e is FlowEntry & { pose: Pose } => !!e.pose);

  const curve = entries.map((e) => ({ start: e.start, seconds: e.seconds, intensity: poseIntensity(e.pose), itemId: e.item.id }));
  const peak = [...known].sort(
    (a, b) => poseIntensity(b.pose) - poseIntensity(a.pose) || b.seconds - a.seconds || a.index - b.index,
  )[0];

  const levels = (["debutant", "intermediaire", "avance"] as Level[]).map((level) => {
    const of = known.filter((e) => e.pose.level === level);
    return { level, seconds: of.reduce((n, e) => n + e.seconds, 0), count: of.length };
  });
  const avgLevel = known.length ? known.reduce((n, e) => n + LEVEL_RANK[e.pose.level], 0) / known.length : 0;

  const sides = { left: 0, right: 0, both: 0, none: 0 };
  const perPose = new Map<string, { pose: Pose; right: number; left: number; itemIds: string[] }>();
  for (const e of entries) {
    const side = e.item.side;
    if (side === "droite") sides.right += e.seconds;
    else if (side === "gauche") sides.left += e.seconds;
    else if (side === "les-deux") {
      sides.right += e.seconds / 2;
      sides.left += e.seconds / 2;
      sides.both += e.seconds;
    } else sides.none += e.seconds;
    if (e.pose && (side === "droite" || side === "gauche")) {
      const row = perPose.get(e.pose.id) ?? { pose: e.pose, right: 0, left: 0, itemIds: [] };
      row[side === "droite" ? "right" : "left"] += 1;
      row.itemIds.push(e.item.id);
      perPose.set(e.pose.id, row);
    }
  }
  const unmatched = [...perPose.values()].filter((r) => r.right !== r.left);

  const catSeconds = new Map<Category, number>();
  const zoneScore = new Map<Zone, number>();
  const chakraSeconds = new Map<Chakra, number>();
  for (const e of known) {
    for (const c of e.pose.categories) {
      catSeconds.set(c, (catSeconds.get(c) ?? 0) + e.seconds);
      for (const [z, w] of Object.entries(CATEGORY_ZONES[c] ?? {}) as [Zone, number][])
        zoneScore.set(z, (zoneScore.get(z) ?? 0) + w * e.seconds * (0.6 + LEVEL_RANK[e.pose.level] * 0.2));
    }
    const ch = poseChakras(e.pose);
    for (const c of ch) chakraSeconds.set(c, (chakraSeconds.get(c) ?? 0) + e.seconds / ch.length);
  }
  const maxZone = Math.max(0, ...zoneScore.values());
  const zones = ZONES
    .map((zone) => ({ zone, score: maxZone ? (zoneScore.get(zone) ?? 0) / maxZone : 0 }))
    .sort((a, b) => b.score - a.score);
  const categories = [...catSeconds.entries()]
    .map(([category, seconds]) => ({ category, seconds }))
    .sort((a, b) => b.seconds - a.seconds);
  const chakras = CHAKRA_ORDER.map((chakra) => ({ chakra, seconds: chakraSeconds.get(chakra) ?? 0 }));

  const insights: Insight[] = [];
  if (entries.length) {
    for (const u of unmatched)
      insights.push({
        tone: "warn",
        kind: "unmatched-sides",
        pose: u.pose,
        right: u.right,
        left: u.left,
        itemIds: u.itemIds,
      });
    const tooHard = known.filter((e) => LEVEL_RANK[e.pose.level] > LEVEL_RANK[plan.level]);
    if (tooHard.length)
      insights.push({
        tone: "warn",
        kind: "above-level",
        count: tooHard.length,
        itemIds: tooHard.map((e) => e.item.id),
      });
    const opening = curve.slice(0, 3);
    if (opening.length === 3 && opening.reduce((n, c) => n + c.intensity, 0) / 3 >= 3)
      insights.push({ tone: "warn", kind: "intense-start", itemIds: opening.map((c) => c.itemId) });
    const last = known.at(-1);
    if (last && !last.pose.categories.includes("restauratrice") && last.pose.id !== "savasana")
      insights.push({ tone: "warn", kind: "no-rest-end" });
    const target = plan.targetMinutes * 60;
    if (total > target * 1.1)
      insights.push({ tone: "warn", kind: "over-target", minutes: Math.round((total - target) / 60) });
    else if (total < target * 0.8)
      insights.push({ tone: "warn", kind: "under-target", minutes: Math.round((target - total) / 60) });
    if (!insights.length) insights.push({ tone: "ok", kind: "balanced" });
  }

  return { count: entries.length, total, avgLevel, peak, curve, levels, sides, unmatched, categories, zones, chakras, insights };
}
