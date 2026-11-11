import type { Breath, ClassPlan, Pose } from "./types";

export interface PlayStep {
  key: string;
  itemId: string;
  pose: Pose | undefined;
  /** Les postures « les deux côtés » sont jouées à droite puis à gauche. */
  side: "droite" | "gauche" | null;
  seconds: number;
  /** Respirations à guider, quand la tenue est exprimée en respirations. */
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

/** Ce que la voix annonce au début d'une posture. */
export function announcement(step: PlayStep, opts: { sanskrit: boolean; cues: boolean }): string {
  const parts: string[] = [];
  if (step.breath === "inspire") parts.push("Inspire.");
  if (step.breath === "expire") parts.push("Expire.");
  const name = step.pose?.nameFr ?? "Posture";
  parts.push(`${name}${step.side ? `, côté ${step.side}` : ""}.`);
  if (opts.sanskrit && step.pose?.sanskrit) parts.push(`${step.pose.sanskrit}.`);
  if (opts.cues) {
    const cue = step.cue.trim() || step.pose?.details?.cuesShort?.[0] || "";
    if (cue) parts.push(cue);
  }
  if (step.breaths) parts.push(`${step.breaths} respiration${step.breaths > 1 ? "s" : ""}.`);
  return parts.join(" ");
}
