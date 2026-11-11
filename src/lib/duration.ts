import type { ClassPlan, Section, SequenceItem } from "./types";

/** Durée moyenne d'un cycle respiratoire en cours de yoga (inspiration + expiration). */
export const SECONDS_PER_BREATH = 5;

export function itemSeconds(item: SequenceItem): number {
  const base = item.unit === "respirations" ? item.hold * SECONDS_PER_BREATH : item.hold;
  return item.side === "les-deux" ? base * 2 : base;
}

export function sectionSeconds(section: Section): number {
  return section.items.reduce((sum, it) => sum + itemSeconds(it), 0);
}

export function planSeconds(plan: ClassPlan): number {
  return plan.sections.reduce((sum, s) => sum + sectionSeconds(s), 0);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
}

export function formatHold(item: SequenceItem): string {
  return item.unit === "respirations"
    ? `${item.hold} resp.`
    : formatDuration(item.hold);
}

/** Durée courte pour les pastilles : « 30 s », « 1 min 30 », « 5 resp. ». */
export function formatHoldShort(item: SequenceItem): string {
  if (item.unit === "respirations") return `${item.hold} resp.`;
  const s = item.hold;
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${String(r).padStart(2, "0")}` : `${m} min`;
}

/** Horloge « 1:05 » pour le lecteur. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
