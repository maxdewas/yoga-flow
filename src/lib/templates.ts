import type { Locale, Localized } from "./locale";
import type { Breath, ClassStyle, HoldUnit, Level, Section, SequenceItem, Side } from "./types";

/** [poseId, hold, unit, side, breath]. Unit defaults to breaths; side defaults from the pose (both sides or none). */
export type Step = [string, number, HoldUnit?, Side?, Breath?];

/** Step held in breaths with a breath cue. */
export const br = (poseId: string, hold: number, breath: Breath, side?: Side): Step => [poseId, hold, "respirations", side, breath];

/** A built-in section: its title is written in every language and resolved when the section is created. */
export interface StepSection {
  title: Localized<string>;
  steps: Step[];
}

/** Built-in class template. Texts are resolved in the active language when the template is loaded into a plan. */
export interface Template {
  id: string;
  title: Localized<string>;
  style: ClassStyle;
  level: Level;
  targetMinutes: number;
  theme: Localized<string>;
  sections: StepSection[];
}

/** Section titles shared by the built-in templates and the generator. */
export const SECTION_TITLES = {
  centrage: { fr: "Centrage", en: "Centering", es: "Centramiento" },
  echauffement: { fr: "Échauffement", en: "Warm-up", es: "Calentamiento" },
  salutationDouce: { fr: "Salutation douce", en: "Gentle salutation", es: "Saludo suave" },
  salutation: { fr: "Salutation au soleil", en: "Sun salutation", es: "Saludo al sol" },
  salutationsA: { fr: "Salutations au soleil A", en: "Sun salutations A", es: "Saludos al sol A" },
  debout: { fr: "Debout", en: "Standing", es: "De pie" },
  serieDebout: { fr: "Série debout", en: "Standing series", es: "Serie de pie" },
  equilibre: { fr: "Équilibre", en: "Balance", es: "Equilibrio" },
  sommet: { fr: "Posture au sommet", en: "Peak pose", es: "Postura cumbre" },
  contrePostures: { fr: "Contre-postures", en: "Counter-poses", es: "Contraposturas" },
  auSol: { fr: "Au sol", en: "On the floor", es: "En el suelo" },
  arrivee: { fr: "Arrivée", en: "Arrival", es: "Llegada" },
  posturesYin: { fr: "Postures yin", en: "Yin poses", es: "Posturas yin" },
  posturesSoutenues: { fr: "Postures soutenues", en: "Supported poses", es: "Posturas con soporte" },
  retourCalme: { fr: "Retour au calme", en: "Cool-down", es: "Vuelta a la calma" },
  relaxation: { fr: "Relaxation", en: "Relaxation", es: "Relajación" },
} satisfies Record<string, Localized<string>>;
const T = SECTION_TITLES;

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
    title: { fr: "Réveil en douceur", en: "Gentle wake-up", es: "Despertar suave" },
    style: "doux",
    level: "debutant",
    targetMinutes: 20,
    theme: { fr: "Matin, mobilité", en: "Morning, mobility", es: "Mañana, movilidad" },
    sections: [
      { title: T.centrage, steps: [["facile", 60, "secondes"], ["torsion-assise-simple", 5]] },
      { title: T.echauffement, steps: [["quatre-pattes", 3], ["chat", 5], ["vache", 5], ["fil-aiguille", 5], ["chien-tete-en-bas", 5]] },
      { title: T.salutationDouce, steps: SUN_SALUTATION_DOUCE },
      { title: T.debout, steps: [["guerrier-2", 5], ["guerrier-inverse", 3], ["triangle", 5], ["arbre", 5]] },
      { title: T.auSol, steps: [["pont", 5], ["genoux-poitrine", 5], ["torsion-allongee", 5]] },
      { title: T.relaxation, steps: [["savasana", 480, "secondes"]] },
    ],
  },
  {
    id: "vinyasa-debutant",
    title: { fr: "Vinyasa débutant", en: "Beginner vinyasa", es: "Vinyasa para principiantes" },
    style: "vinyasa",
    level: "debutant",
    targetMinutes: 30,
    theme: { fr: "Ancrage et fluidité", en: "Grounding and flow", es: "Enraizamiento y fluidez" },
    sections: [
      { title: T.centrage, steps: [["enfant", 10], ["quatre-pattes", 2], ["chat", 5], ["vache", 5]] },
      { title: T.salutationsA, steps: [...SUN_SALUTATION_A, ...SUN_SALUTATION_A, ...SUN_SALUTATION_A] },
      {
        title: T.serieDebout,
        steps: [["guerrier-1", 5], ["guerrier-2", 5], ["guerrier-inverse", 3], ["angle-lateral", 5], ["triangle", 5], ["grand-ecart-facial-debout", 5]],
      },
      { title: T.equilibre, steps: [["arbre", 5], ["aigle", 5]] },
      { title: T.sommet, steps: [["chameau", 3], ["enfant", 5]] },
      { title: T.auSol, steps: [["pigeon", 10], ["pince-assise", 8], ["demi-seigneur-poissons", 5], ["pont", 5]] },
      { title: T.retourCalme, steps: [["bebe-heureux", 5], ["torsion-allongee", 5], ["savasana", 540, "secondes"]] },
    ],
  },
  {
    id: "hanches",
    title: { fr: "Ouverture des hanches", en: "Hip opening", es: "Apertura de caderas" },
    style: "hatha",
    level: "intermediaire",
    targetMinutes: 30,
    theme: { fr: "Libérer les hanches", en: "Releasing the hips", es: "Liberar las caderas" },
    sections: [
      { title: T.echauffement, steps: [["papillon", 8], ["berceau", 5], ["chat", 5], ["vache", 5], ["chien-tete-en-bas", 5]] },
      { title: T.debout, steps: [["fente-basse", 5], ["lezard", 8], ["guerrier-2", 5], ["deesse", 5], ["fente-laterale", 5], ["guirlande", 8]] },
      { title: T.sommet, steps: [["pigeon", 20], ["grenouille", 15], ["tete-vache", 8]] },
      { title: T.contrePostures, steps: [["pince-assise", 8], ["chiffre-quatre", 8]] },
      { title: T.relaxation, steps: [["papillon-allonge", 120, "secondes"], ["savasana", 420, "secondes"]] },
    ],
  },
  {
    id: "yin-soir",
    title: { fr: "Yin du soir", en: "Evening yin", es: "Yin de la noche" },
    style: "yin",
    level: "debutant",
    targetMinutes: 60,
    theme: { fr: "Lâcher-prise", en: "Letting go", es: "Soltar" },
    sections: [
      { title: T.arrivee, steps: [["crocodile", 120, "secondes"]] },
      {
        title: T.posturesYin,
        steps: [
          ["papillon", 240, "secondes"], ["chiot", 180, "secondes"], ["enfant-etendu", 180, "secondes"],
          ["pigeon", 240, "secondes"], ["demi-grand-ecart", 180, "secondes"], ["sphinx", 180, "secondes"],
          ["banane", 180, "secondes"], ["torsion-allongee", 180, "secondes"],
        ],
      },
      { title: T.relaxation, steps: [["jambes-au-mur", 300, "secondes"], ["savasana", 360, "secondes"]] },
    ],
  },
  {
    id: "restauratif",
    title: { fr: "Restauratif anti-stress", en: "Stress-relief restorative", es: "Restaurativo antiestrés" },
    style: "restauratif",
    level: "debutant",
    targetMinutes: 45,
    theme: { fr: "Système nerveux au calme", en: "A calm nervous system", es: "Sistema nervioso en calma" },
    sections: [
      {
        title: T.posturesSoutenues,
        steps: [
          ["enfant-soutenu", 300, "secondes"], ["poisson-soutenu", 300, "secondes"], ["pont-soutenu", 300, "secondes"],
          ["papillon-allonge", 300, "secondes"], ["torsion-allongee", 180, "secondes"], ["jambes-au-mur", 420, "secondes"],
        ],
      },
      { title: T.relaxation, steps: [["savasana", 600, "secondes"]] },
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

/** Creates plan sections; titles are written in `locale` and then belong to the plan. */
export function sectionsFromSteps(sections: StepSection[], isSided: (poseId: string) => boolean, locale: Locale): Section[] {
  return sections.map((s) => ({ id: crypto.randomUUID(), title: s.title[locale], items: itemsFromSteps(s.steps, isSided) }));
}

/** Whether `title` is a built-in template title in any language (so loading another template may replace it). */
export function isTemplateTitle(title: string): boolean {
  return TEMPLATES.some((t) => Object.values(t.title).includes(title));
}
