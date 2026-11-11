import type { Localized } from "./locale";
import { br, SUN_SALUTATION_A, SUN_SALUTATION_DOUCE, type Step } from "./templates";
import type { Level } from "./types";

/** Stable role codes (historically French); display them with SEQUENCE_ROLE_LABELS. */
export type SequenceRole = "Échauffement" | "Cœur de séance" | "Transition" | "Retour au calme" | "Yin & calme";

export const SEQUENCE_ROLE_LABELS: Localized<Record<SequenceRole, string>> = {
  fr: {
    "Échauffement": "Échauffement",
    "Cœur de séance": "Cœur de séance",
    Transition: "Transition",
    "Retour au calme": "Retour au calme",
    "Yin & calme": "Yin & calme",
  },
  en: {
    "Échauffement": "Warm-up",
    "Cœur de séance": "Main practice",
    Transition: "Transition",
    "Retour au calme": "Cool-down",
    "Yin & calme": "Yin & calm",
  },
  es: {
    "Échauffement": "Calentamiento",
    "Cœur de séance": "Parte principal",
    Transition: "Transición",
    "Retour au calme": "Vuelta a la calma",
    "Yin & calme": "Yin y calma",
  },
};

/** Enchaînement classique proposé dans l'éditeur ; composé pour Flow Creator à partir de postures du catalogue. */
export interface BuiltinSequence {
  id: string;
  title: Localized<string>;
  role: SequenceRole;
  level: Level;
  steps: Step[];
}

const SUN_SALUTATION_B: Step[] = [
  br("montagne", 1, "respire"), br("chaise", 1, "inspire"), br("pince-debout", 1, "expire"),
  br("demi-pince-debout", 1, "inspire"), br("chaturanga", 1, "expire"), br("chien-tete-en-haut", 1, "inspire"),
  br("chien-tete-en-bas", 1, "expire"), br("guerrier-1", 1, "inspire", "droite"), br("chaturanga", 1, "expire"),
  br("chien-tete-en-haut", 1, "inspire"), br("chien-tete-en-bas", 1, "expire"), br("guerrier-1", 1, "inspire", "gauche"),
  br("chaturanga", 1, "expire"), br("chien-tete-en-haut", 1, "inspire"), br("chien-tete-en-bas", 5, "respire"),
  br("demi-pince-debout", 1, "inspire"), br("pince-debout", 1, "expire"), br("chaise", 1, "inspire"),
  br("montagne", 1, "expire"),
];

const MOON_SALUTATION: Step[] = [
  br("montagne", 2, "respire"), ["flexion-laterale-debout", 2, "respirations", "droite"], ["flexion-laterale-debout", 2, "respirations", "gauche"],
  br("deesse", 2, "expire"), br("etoile", 1, "inspire"), ["triangle", 3, "respirations", "droite"], ["pyramide", 3, "respirations", "droite"],
  ["fente-basse", 2, "respirations", "droite"], ["fente-laterale", 2, "respirations", "droite"], br("guirlande", 3, "respire"),
  ["fente-laterale", 2, "respirations", "gauche"], ["fente-basse", 2, "respirations", "gauche"], ["pyramide", 3, "respirations", "gauche"], ["triangle", 3, "respirations", "gauche"],
  br("etoile", 1, "inspire"), br("deesse", 2, "expire"), br("montagne", 2, "respire"),
];

export const BUILTIN_SEQUENCES: BuiltinSequence[] = [
  { id: "salutation-a", title: { fr: "Salutation au soleil A", en: "Sun salutation A", es: "Saludo al sol A" }, role: "Échauffement", level: "debutant", steps: SUN_SALUTATION_A },
  { id: "salutation-b", title: { fr: "Salutation au soleil B", en: "Sun salutation B", es: "Saludo al sol B" }, role: "Échauffement", level: "intermediaire", steps: SUN_SALUTATION_B },
  { id: "salutation-douce", title: { fr: "Salutation au soleil douce", en: "Gentle sun salutation", es: "Saludo al sol suave" }, role: "Échauffement", level: "debutant", steps: SUN_SALUTATION_DOUCE },
  { id: "salutation-lune", title: { fr: "Salutation à la lune", en: "Moon salutation", es: "Saludo a la luna" }, role: "Échauffement", level: "debutant", steps: MOON_SALUTATION },
  {
    id: "quatre-pattes",
    title: { fr: "Éveil à quatre pattes", en: "All-fours awakening", es: "Despertar en cuadrupedia" },
    role: "Échauffement",
    level: "debutant",
    steps: [
      br("quatre-pattes", 2, "respire"), br("vache", 1, "inspire"), br("chat", 1, "expire"), br("vache", 1, "inspire"),
      br("chat", 1, "expire"), ["fil-aiguille", 5], br("chien-tete-en-bas", 5, "respire"), br("enfant", 5, "respire"),
    ],
  },
  {
    id: "centrage-assis",
    title: { fr: "Centrage assis", en: "Seated centering", es: "Centramiento sentado" },
    role: "Échauffement",
    level: "debutant",
    steps: [["facile", 60, "secondes", undefined, "respire"], ["etirement-cou-assis", 3], ["cercles-buste-assis", 5], ["torsion-assise-simple", 5], ["etirement-lateral-assis", 3]],
  },
  {
    id: "guerriers",
    title: { fr: "Série des guerriers", en: "Warrior series", es: "Serie de guerreros" },
    role: "Cœur de séance",
    level: "debutant",
    steps: [["guerrier-1", 5], ["guerrier-2", 5], ["guerrier-inverse", 3], ["angle-lateral", 5], ["triangle", 5]],
  },
  {
    id: "equilibres",
    title: { fr: "Équilibres debout", en: "Standing balances", es: "Equilibrios de pie" },
    role: "Cœur de séance",
    level: "intermediaire",
    steps: [br("montagne", 3, "respire"), ["arbre", 5], ["aigle", 5], ["guerrier-3", 3], ["demi-lune", 3], ["danseur", 5]],
  },
  {
    id: "force-debout",
    title: { fr: "Force debout", en: "Standing strength", es: "Fuerza de pie" },
    role: "Cœur de séance",
    level: "debutant",
    steps: [["chaise", 5], ["chaise-tournee", 3], ["fente-haute", 5], ["deesse", 5], ["guerrier-2", 5]],
  },
  {
    id: "hanches",
    title: { fr: "Ouverture des hanches", en: "Hip opening", es: "Apertura de caderas" },
    role: "Cœur de séance",
    level: "intermediaire",
    steps: [["fente-basse", 5], ["lezard", 5], ["pigeon", 10], ["papillon", 8], ["guirlande", 5]],
  },
  {
    id: "flexions-arriere",
    title: { fr: "Flexions arrière progressives", en: "Progressive backbends", es: "Extensiones progresivas" },
    role: "Cœur de séance",
    level: "intermediaire",
    steps: [["sphinx", 5], ["cobra", 3], ["sauterelle", 3], ["arc", 3], br("enfant", 5, "respire"), ["pont", 5]],
  },
  {
    id: "torsions",
    title: { fr: "Torsions", en: "Twists", es: "Torsiones" },
    role: "Cœur de séance",
    level: "debutant",
    steps: [["torsion-assise-simple", 5], ["demi-seigneur-poissons", 5], ["chaise-tournee", 3], ["torsion-allongee", 8]],
  },
  {
    id: "gainage",
    title: { fr: "Gainage", en: "Core strength", es: "Fuerza de core" },
    role: "Cœur de séance",
    level: "intermediaire",
    steps: [["oiseau-chien", 5], ["planche", 5], ["planche-laterale", 3], ["bateau", 5], ["dauphin", 5]],
  },
  {
    id: "inversions",
    title: { fr: "Inversions & contre-postures", en: "Inversions & counter-poses", es: "Inversiones y contraposturas" },
    role: "Cœur de séance",
    level: "avance",
    steps: [["dauphin", 5], ["chandelle", 10], ["charrue", 5], ["poisson", 5], ["genoux-poitrine", 5]],
  },
  {
    id: "vinyasa",
    title: { fr: "Vinyasa (transition)", en: "Vinyasa (transition)", es: "Vinyasa (transición)" },
    role: "Transition",
    level: "debutant",
    steps: [br("planche", 1, "inspire"), br("chaturanga", 1, "expire"), br("chien-tete-en-haut", 1, "inspire"), br("chien-tete-en-bas", 3, "expire")],
  },
  {
    id: "retour-sol",
    title: { fr: "Retour au calme au sol", en: "Floor cool-down", es: "Vuelta a la calma en el suelo" },
    role: "Retour au calme",
    level: "debutant",
    steps: [["pince-assise", 8], ["tete-au-genou", 5], ["bebe-heureux", 5], ["torsion-allongee", 5], ["savasana", 300, "secondes", undefined, "respire"]],
  },
  {
    id: "relaxation",
    title: { fr: "Relaxation guidée", en: "Guided relaxation", es: "Relajación guiada" },
    role: "Retour au calme",
    level: "debutant",
    steps: [["genoux-poitrine", 5], ["jambes-au-mur", 180, "secondes"], ["savasana", 480, "secondes", undefined, "respire"]],
  },
  {
    id: "yin-hanches",
    title: { fr: "Yin des hanches", en: "Yin for the hips", es: "Yin de caderas" },
    role: "Yin & calme",
    level: "debutant",
    steps: [["yin-papillon", 180, "secondes"], ["yin-cygne", 180, "secondes"], ["yin-dragon", 120, "secondes"], ["yin-lacet", 180, "secondes"]],
  },
  {
    id: "souffle",
    title: { fr: "Souffle & méditation", en: "Breath & meditation", es: "Respiración y meditación" },
    role: "Yin & calme",
    level: "debutant",
    steps: [["med-tailleur-coussin", 60, "secondes", undefined, "respire"], ["resp-alternee", 180, "secondes"], ["mudra-chin", 180, "secondes", undefined, "respire"]],
  },
];

export const SEQUENCE_ROLES: SequenceRole[] = ["Échauffement", "Cœur de séance", "Transition", "Retour au calme", "Yin & calme"];
