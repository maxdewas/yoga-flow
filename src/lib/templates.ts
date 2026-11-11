import type { Breath, ClassStyle, HoldUnit, Level, Section, SequenceItem, Side } from "./types";

/** [poseId, hold, unit, side, breath]. Unit defaults to breaths; side defaults from the pose (both sides or none). */
export type Step = [string, number, HoldUnit?, Side?, Breath?];

/** Step held in breaths with a breath cue. */
export const br = (poseId: string, hold: number, breath: Breath, side?: Side): Step => [poseId, hold, "respirations", side, breath];

export interface Template {
  id: string;
  title: string;
  style: ClassStyle;
  level: Level;
  targetMinutes: number;
  theme: string;
  sections: { title: string; steps: Step[] }[];
}

/** Salutation au soleil A, une ronde (1 respiration par posture sauf le chien). */
export const SUN_SALUTATION_A: Step[] = [
  br("montagne", 1, "respire"), br("bras-leves", 1, "inspire"), br("pince-debout", 1, "expire"),
  br("demi-pince-debout", 1, "inspire"), br("chaturanga", 1, "expire"), br("chien-tete-en-haut", 1, "inspire"),
  br("chien-tete-en-bas", 5, "respire"), br("demi-pince-debout", 1, "inspire"), br("pince-debout", 1, "expire"),
  br("bras-leves", 1, "inspire"), br("montagne", 1, "expire"),
];

/** Version douce : genoux au sol, cobra au lieu du chien tête en haut. */
export const SUN_SALUTATION_DOUCE: Step[] = [
  ["montagne", 1], ["bras-leves", 1], ["pince-debout", 1], ["fente-basse", 2, "respirations", "droite"],
  ["planche-genoux", 1], ["huit-points", 1], ["cobra", 1], ["chien-tete-en-bas", 3],
  ["fente-basse", 2, "respirations", "gauche"], ["pince-debout", 1], ["bras-leves", 1], ["montagne", 1],
];

export const TEMPLATES: Template[] = [
  {
    id: "reveil-doux",
    title: "Réveil en douceur",
    style: "doux",
    level: "debutant",
    targetMinutes: 20,
    theme: "Matin, mobilité",
    sections: [
      { title: "Centrage", steps: [["facile", 60, "secondes"], ["torsion-assise-simple", 5]] },
      { title: "Échauffement", steps: [["quatre-pattes", 3], ["chat", 5], ["vache", 5], ["fil-aiguille", 5], ["chien-tete-en-bas", 5]] },
      { title: "Salutation douce", steps: SUN_SALUTATION_DOUCE },
      { title: "Debout", steps: [["guerrier-2", 5], ["guerrier-inverse", 3], ["triangle", 5], ["arbre", 5]] },
      { title: "Au sol", steps: [["pont", 5], ["genoux-poitrine", 5], ["torsion-allongee", 5]] },
      { title: "Relaxation", steps: [["savasana", 480, "secondes"]] },
    ],
  },
  {
    id: "vinyasa-debutant",
    title: "Vinyasa débutant",
    style: "vinyasa",
    level: "debutant",
    targetMinutes: 30,
    theme: "Ancrage et fluidité",
    sections: [
      { title: "Centrage", steps: [["enfant", 10], ["quatre-pattes", 2], ["chat", 5], ["vache", 5]] },
      { title: "Salutations au soleil A", steps: [...SUN_SALUTATION_A, ...SUN_SALUTATION_A, ...SUN_SALUTATION_A] },
      {
        title: "Série debout",
        steps: [["guerrier-1", 5], ["guerrier-2", 5], ["guerrier-inverse", 3], ["angle-lateral", 5], ["triangle", 5], ["grand-ecart-facial-debout", 5]],
      },
      { title: "Équilibre", steps: [["arbre", 5], ["aigle", 5]] },
      { title: "Posture au sommet", steps: [["chameau", 3], ["enfant", 5]] },
      { title: "Au sol", steps: [["pigeon", 10], ["pince-assise", 8], ["demi-seigneur-poissons", 5], ["pont", 5]] },
      { title: "Retour au calme", steps: [["bebe-heureux", 5], ["torsion-allongee", 5], ["savasana", 540, "secondes"]] },
    ],
  },
  {
    id: "hanches",
    title: "Ouverture des hanches",
    style: "hatha",
    level: "intermediaire",
    targetMinutes: 30,
    theme: "Libérer les hanches",
    sections: [
      { title: "Échauffement", steps: [["papillon", 8], ["berceau", 5], ["chat", 5], ["vache", 5], ["chien-tete-en-bas", 5]] },
      { title: "Debout", steps: [["fente-basse", 5], ["lezard", 8], ["guerrier-2", 5], ["deesse", 5], ["fente-laterale", 5], ["guirlande", 8]] },
      { title: "Posture au sommet", steps: [["pigeon", 20], ["grenouille", 15], ["tete-vache", 8]] },
      { title: "Contre-postures", steps: [["pince-assise", 8], ["chiffre-quatre", 8]] },
      { title: "Relaxation", steps: [["papillon-allonge", 120, "secondes"], ["savasana", 420, "secondes"]] },
    ],
  },
  {
    id: "yin-soir",
    title: "Yin du soir",
    style: "yin",
    level: "debutant",
    targetMinutes: 60,
    theme: "Lâcher-prise",
    sections: [
      { title: "Arrivée", steps: [["crocodile", 120, "secondes"]] },
      {
        title: "Postures yin",
        steps: [
          ["papillon", 240, "secondes"], ["chiot", 180, "secondes"], ["enfant-etendu", 180, "secondes"],
          ["pigeon", 240, "secondes"], ["demi-grand-ecart", 180, "secondes"], ["sphinx", 180, "secondes"],
          ["banane", 180, "secondes"], ["torsion-allongee", 180, "secondes"],
        ],
      },
      { title: "Relaxation", steps: [["jambes-au-mur", 300, "secondes"], ["savasana", 360, "secondes"]] },
    ],
  },
  {
    id: "restauratif",
    title: "Restauratif anti-stress",
    style: "restauratif",
    level: "debutant",
    targetMinutes: 45,
    theme: "Système nerveux au calme",
    sections: [
      {
        title: "Postures soutenues",
        steps: [
          ["enfant-soutenu", 300, "secondes"], ["poisson-soutenu", 300, "secondes"], ["pont-soutenu", 300, "secondes"],
          ["papillon-allonge", 300, "secondes"], ["torsion-allongee", 180, "secondes"], ["jambes-au-mur", 420, "secondes"],
        ],
      },
      { title: "Relaxation", steps: [["savasana", 600, "secondes"]] },
    ],
  },
];

export function itemsFromSteps(steps: Step[], isSided: (poseId: string) => boolean): SequenceItem[] {
  return steps.map(
    ([poseId, hold, unit = "respirations", side, breath = "aucun"]): SequenceItem => ({
      id: crypto.randomUUID(),
      poseId,
      hold,
      unit,
      side: side ?? (isSided(poseId) ? "les-deux" : "aucun"),
      breath,
      cue: "",
    }),
  );
}

export function sectionsFromSteps(
  sections: { title: string; steps: Step[] }[],
  isSided: (poseId: string) => boolean,
): Section[] {
  return sections.map((s) => ({ id: crypto.randomUUID(), title: s.title, items: itemsFromSteps(s.steps, isSided) }));
}
