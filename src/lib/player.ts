import { format, type Locale, type Localized } from "./locale";
import type { Breath, ClassPlan, Pose } from "./types";

export interface PlayStep {
  key: string;
  itemId: string;
  pose: Pose | undefined;
  /** "Both sides" poses are played on the right, then on the left. */
  side: "droite" | "gauche" | null;
  seconds: number;
  /** Breaths to guide, when the hold is counted in breaths. */
  breaths: number | null;
  breath: Breath;
  cue: string;
  sectionTitle: string;
}

export function playSteps(plan: Pick<ClassPlan, "sections">, poseMap: Map<string, Pose>, secondsPerBreath: number): PlayStep[] {
  const steps: PlayStep[] = [];
  for (const section of plan.sections)
    for (const item of section.items) {
      const breaths = item.unit === "respirations" ? item.hold : null;
      const seconds = breaths !== null ? breaths * secondsPerBreath : item.hold;
      const base = {
        itemId: item.id,
        pose: poseMap.get(item.poseId),
        seconds: Math.max(1, seconds),
        breaths,
        breath: item.breath ?? "aucun",
        cue: item.cue,
        sectionTitle: section.title,
      };
      if (item.side === "les-deux") {
        steps.push({ ...base, key: `${item.id}-d`, side: "droite" });
        steps.push({ ...base, key: `${item.id}-g`, side: "gauche" });
      } else {
        steps.push({ ...base, key: item.id, side: item.side === "aucun" ? null : item.side });
      }
    }
  return steps;
}

/** Spoken texts of the player, per language. */
export const VOICE: Localized<{
  inhale: string;
  exhale: string;
  pose: string;
  side: Record<"droite" | "gauche", string>;
  breaths: (n: number) => string;
  ready: string;
  done: string;
}> = {
  fr: {
    inhale: "Inspire.",
    exhale: "Expire.",
    pose: "Posture",
    side: { droite: "côté droit", gauche: "côté gauche" },
    breaths: (n) => `${n} respiration${n > 1 ? "s" : ""}.`,
    ready: "Prépare-toi. Première posture : {name}.",
    done: "C'est terminé. Prends un instant pour ressentir les effets de ta pratique. Namasté.",
  },
  en: {
    inhale: "Inhale.",
    exhale: "Exhale.",
    pose: "Pose",
    side: { droite: "right side", gauche: "left side" },
    breaths: (n) => `${n} breath${n > 1 ? "s" : ""}.`,
    ready: "Get ready. First pose: {name}.",
    done: "Your practice is complete. Take a moment to feel its effects. Namaste.",
  },
  es: {
    inhale: "Inhala.",
    exhale: "Exhala.",
    pose: "Postura",
    side: { droite: "lado derecho", gauche: "lado izquierdo" },
    breaths: (n) => (n > 1 ? `${n} respiraciones.` : `${n} respiración.`),
    ready: "Prepárate. Primera postura: {name}.",
    done: "Has terminado. Tómate un momento para sentir los efectos de tu práctica. Namasté.",
  },
};

/** What the voice announces at the start of a pose. */
export function announcement(step: PlayStep, opts: { sanskrit: boolean; cues: boolean }, locale: Locale = "fr"): string {
  const v = VOICE[locale];
  const parts: string[] = [];
  if (step.breath === "inspire") parts.push(v.inhale);
  if (step.breath === "expire") parts.push(v.exhale);
  const name = step.pose?.name ?? v.pose;
  parts.push(`${name}${step.side ? `, ${v.side[step.side]}` : ""}.`);
  if (opts.sanskrit && step.pose?.sanskrit) parts.push(`${step.pose.sanskrit}.`);
  if (opts.cues) {
    const cue = step.cue.trim() || step.pose?.details?.cuesShort?.[0] || "";
    if (cue) parts.push(cue);
  }
  if (step.breaths) parts.push(v.breaths(step.breaths));
  return parts.join(" ");
}

/** Spoken before the first pose, during the countdown. */
export function readyAnnouncement(firstPose: Pose | undefined, locale: Locale = "fr"): string {
  const v = VOICE[locale];
  return format(v.ready, { name: firstPose?.name ?? v.pose });
}
