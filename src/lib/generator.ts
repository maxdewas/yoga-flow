import { planSeconds } from "./duration";
import { SUN_SALUTATION_A, SUN_SALUTATION_DOUCE, sectionsFromSteps, type Step } from "./templates";
import type { Category, ClassPlan, ClassStyle, Level, Pose } from "./types";

/**
 * Générateur de cours à base de règles (pas d'IA) :
 * structure classique centrage → échauffement → salutations → debout → sommet → contre-postures → sol → relaxation,
 * postures filtrées par niveau, durées adaptées au style, remplissage jusqu'à la durée visée.
 */
export interface GeneratorOptions {
  style: ClassStyle;
  level: Level;
  targetMinutes: number;
  focus: Category | null;
}

const LEVEL_RANK: Record<Level, number> = { debutant: 0, intermediaire: 1, avance: 2 };

const BREATHS: Record<ClassStyle, number> = { vinyasa: 5, power: 5, hatha: 8, doux: 6, yin: 0, restauratif: 0 };

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Puts poses matching the focus first, keeping some variety. */
function prioritise(pool: Pose[], focus: Category | null): Pose[] {
  const s = shuffle(pool);
  return focus ? [...s.filter((p) => p.categories.includes(focus)), ...s.filter((p) => !p.categories.includes(focus))] : s;
}

const has = (p: Pose, ...cats: Category[]) => cats.some((c) => p.categories.includes(c));

/** Yin practice poses (held long, passive). */
const isYinPose = (p: Pose) => p.family === "yin" && p.id.startsWith("yin-");
/** Meditation seats, mudras and breathing techniques: never picked as a movement in a sequence. */
const isStillness = (p: Pose) => p.family === "yin" && !p.id.startsWith("yin-");
/** Poses for active styles (vinyasa, hatha, doux, power): everything outside the yin family, plus custom poses. */
const isActive = (p: Pose) => p.family !== "yin";

export function generatePlan(opts: GeneratorOptions, poses: Pose[]): Pick<ClassPlan, "sections" | "title"> {
  const allowed = poses.filter((p) => LEVEL_RANK[p.level] <= LEVEL_RANK[opts.level]);
  const byId = new Map(poses.map((p) => [p.id, p]));
  const isSided = (id: string) => byId.get(id)?.sided ?? false;
  const target = opts.targetMinutes * 60;
  const estimate = (secs: { title: string; steps: Step[] }[]) =>
    planSeconds({ sections: sectionsFromSteps(secs, isSided) } as ClassPlan);

  if (opts.style === "yin" || opts.style === "restauratif") {
    const yin = opts.style === "yin";
    const hold = yin ? 180 : 300;
    const pool = prioritise(
      allowed
        .filter((p) => (yin ? isYinPose(p) : has(p, "restauratrice") && !isStillness(p)))
        .filter((p) => p.id !== "savasana"),
      opts.focus,
    );
    const seat = shuffle(allowed.filter((p) => isStillness(p) && p.id.startsWith("med-") && !has(p, "allongee")))[0];
    const main: Step[] = [];
    const secs = [
      { title: "Arrivée", steps: [[seat?.id ?? "crocodile", 120, "secondes"]] as Step[] },
      { title: yin ? "Postures yin" : "Postures soutenues", steps: main },
      { title: "Relaxation", steps: [["savasana", yin ? 360 : 600, "secondes"]] as Step[] },
    ];
    for (const p of pool) {
      if (estimate(secs) + hold * (p.sided ? 2 : 1) > target) continue;
      main.push([p.id, hold, "secondes"]);
    }
    return { title: `${yin ? "Yin" : "Restauratif"} ${opts.targetMinutes} min`, sections: sectionsFromSteps(secs, isSided) };
  }

  const b = BREATHS[opts.style];
  const used = new Set<string>();
  const pick = (pred: (p: Pose) => boolean, n: number): Step[] => {
    const out: Step[] = [];
    for (const p of prioritise(allowed.filter((x) => isActive(x) && !used.has(x.id) && pred(x)), opts.focus)) {
      if (out.length >= n) break;
      used.add(p.id);
      out.push([p.id, b]);
    }
    return out;
  };

  const flowing = opts.style === "vinyasa" || opts.style === "power";
  const salutation = flowing && opts.level !== "debutant" ? SUN_SALUTATION_A : SUN_SALUTATION_DOUCE;
  const rounds = opts.style === "power" ? 4 : flowing ? 3 : opts.style === "hatha" ? 1 : 2;
  const salutationSteps = Array.from({ length: rounds }, () => salutation).flat();
  salutation.forEach(([id]) => used.add(id));

  const centrage: Step[] = [[shuffle(["facile", "enfant", "diamant"])[0], 60, "secondes"]];
  const warmup: Step[] = [["quatre-pattes", 2], ["chat", 5], ["vache", 5], ...pick((p) => has(p, "a-genoux") && !has(p, "flexion-arriere"), 1)];
  ["quatre-pattes", "chat", "vache", "facile", "enfant", "diamant", "savasana"].forEach((id) => used.add(id));

  const peakPool = allowed.filter(
    (p) => isActive(p) && !used.has(p.id) && (opts.focus ? p.categories.includes(opts.focus) : has(p, "flexion-arriere", "ouverture-hanches", "equilibre-bras", "inversion")) && p.level === opts.level,
  );
  const peak = shuffle(peakPool.length ? peakPool : allowed.filter((p) => isActive(p) && !used.has(p.id) && has(p, "ouverture-hanches")))[0];
  if (peak) used.add(peak.id);
  const counter: Step[] = peak
    ? has(peak, "flexion-arriere")
      ? [["enfant", 5], ["torsion-allongee", 5]]
      : has(peak, "inversion")
        ? opts.level === "debutant"
          ? [["genoux-poitrine", 5], ["torsion-allongee", 5]]
          : [["poisson", 5], ["genoux-poitrine", 5]]
        : [["pince-assise", 5]]
    : [];

  const standing: Step[] = pick((p) => has(p, "debout") && !has(p, "equilibre") && !has(p, "flexion-arriere"), 3);
  const balance: Step[] = pick((p) => has(p, "equilibre") && has(p, "debout"), 1);
  const floor: Step[] = [
    ...pick((p) => has(p, "assise") && has(p, "flexion-avant"), 1),
    ...pick((p) => has(p, "torsion") && has(p, "assise", "allongee"), 1),
  ];

  const savasanaSecs = Math.max(300, Math.round(target * 0.1 / 60) * 60);
  const secs = [
    { title: "Centrage", steps: centrage },
    { title: "Échauffement", steps: warmup },
    { title: rounds > 1 ? `Salutations au soleil ×${rounds}` : "Salutation au soleil", steps: salutationSteps },
    { title: "Série debout", steps: standing },
    { title: "Équilibre", steps: balance },
    ...(peak ? [{ title: "Posture au sommet", steps: [[peak.id, b] as Step, ...counter] }] : []),
    { title: "Au sol", steps: floor },
    { title: "Relaxation", steps: [["savasana", savasanaSecs, "secondes"] as Step] },
  ];

  // Fill up to the target length, alternating between standing and floor work.
  // Each part is capped so a long class gets longer holds rather than an endless list of poses.
  const fillers: [Step[], (p: Pose) => boolean, number][] = [
    [standing, (p) => has(p, "debout") && !has(p, "equilibre"), 12],
    [floor, (p) => has(p, "assise", "allongee", "a-genoux") && !has(p, "restauratrice"), 10],
    [balance, (p) => has(p, "equilibre") && has(p, "debout"), 3],
  ];
  for (let i = 0, misses = 0; misses < fillers.length && i < 60; i++) {
    const [list, pred, cap] = fillers[i % fillers.length];
    if (list.length >= cap) {
      misses++;
      continue;
    }
    const next = pick(pred, 1);
    if (!next.length || estimate(secs) + b * 5 * 2 > target) {
      misses++;
      continue;
    }
    misses = 0;
    list.push(...next);
  }

  // Not enough distinct poses for a long class: hold the held poses longer (up to ×3), never the flowing salutations.
  const held = [standing, balance, floor, ...(peak ? [secs.find((s) => s.title === "Posture au sommet")!.steps] : [])];
  const base = held.map((list) => list.map((s) => s[1]));
  for (let factor = 1.25; factor <= 3 && estimate(secs) < target * 0.92; factor += 0.25) {
    held.forEach((list, i) => list.forEach((step, j) => (step[1] = Math.round(base[i][j] * factor))));
  }
  if (estimate(secs) > target * 1.08) {
    held.forEach((list, i) => list.forEach((step, j) => (step[1] = Math.max(base[i][j], Math.round(step[1] / 1.25)))));
  }

  const name = { vinyasa: "Vinyasa", power: "Power", hatha: "Hatha", doux: "Yoga doux" }[opts.style];
  return {
    title: `${name} ${opts.targetMinutes} min`,
    sections: sectionsFromSteps(secs.filter((s) => s.steps.length), isSided),
  };
}

/** Next-pose ideas from the last pose: counter-poses after intense work, same family otherwise. */
export function suggestNext(last: Pose | undefined, poses: Pose[], level: Level, exclude: Set<string>): Pose[] {
  // Stay in the same world as the last pose: yin after yin, active poses otherwise; never mudras or breathing.
  const yinFlow = last ? isYinPose(last) : false;
  const allowed = poses.filter(
    (p) =>
      LEVEL_RANK[p.level] <= LEVEL_RANK[level] &&
      !exclude.has(p.id) &&
      !isStillness(p) &&
      (yinFlow ? isYinPose(p) || has(p, "restauratrice") : isActive(p)),
  );
  if (!last) return shuffle(allowed.filter((p) => ["facile", "enfant", "quatre-pattes", "montagne"].includes(p.id)));
  const want: Category[] = has(last, "flexion-arriere")
    ? ["flexion-avant", "torsion"]
    : has(last, "inversion")
      ? ["allongee", "restauratrice"]
      : has(last, "debout")
        ? ["debout", "equilibre"]
        : has(last, "ouverture-hanches")
          ? ["ouverture-hanches", "flexion-avant"]
          : last.categories;
  return shuffle(allowed.filter((p) => p.id !== last.id && want.some((c) => p.categories.includes(c)))).slice(0, 4);
}
