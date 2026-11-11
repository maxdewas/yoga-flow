import type { PoseDetails } from "./details";
import type { FigureDef } from "./figure";

export type Level = "debutant" | "intermediaire" | "avance";

export type Category =
  | "debout"
  | "a-genoux"
  | "assise"
  | "allongee"
  | "equilibre"
  | "flexion-avant"
  | "flexion-arriere"
  | "torsion"
  | "inversion"
  | "ouverture-hanches"
  | "gainage"
  | "equilibre-bras"
  | "restauratrice";

export interface Pose {
  id: string;
  nameFr: string;
  sanskrit: string;
  nameEn: string;
  categories: Category[];
  level: Level;
  /** True when the pose is practised on one side then the other. */
  sided: boolean;
  description: string;
  benefits: string[];
  contraindications: string[];
  /** Fiche détaillée (catalogue, éventuellement complétée par la prof). */
  details?: PoseDetails;
  /** Family file the built-in pose comes from (absent for custom poses). */
  family?: string;
  /** Illustration file under /public/poses (e.g. generated); shown before the mannequin figure. */
  image?: string;
  /** Mannequin drawing, used when there is no photo or illustration. */
  figure?: FigureDef;
  /** Created by the user rather than shipped with the app. */
  custom?: boolean;
}

export type Side = "aucun" | "droite" | "gauche" | "les-deux";
export type HoldUnit = "respirations" | "secondes";
/** Repère de souffle annoncé sur la posture. */
export type Breath = "aucun" | "inspire" | "expire" | "respire";

export interface SequenceItem {
  id: string;
  poseId: string;
  hold: number;
  unit: HoldUnit;
  side: Side;
  /** Absent sur les cours créés avant l'ajout des repères de souffle (= « aucun »). */
  breath?: Breath;
  cue: string;
}

/** Enchaînement enregistré par la prof, réutilisable dans tous ses cours. */
export interface SavedSequence {
  id: string;
  title: string;
  items: Omit<SequenceItem, "id">[];
  createdAt: string;
}

export interface Section {
  id: string;
  title: string;
  items: SequenceItem[];
}

export type ClassStyle = "vinyasa" | "hatha" | "yin" | "doux" | "restauratif" | "power";

export const STYLE_LABELS: Record<ClassStyle, string> = {
  vinyasa: "Vinyasa",
  hatha: "Hatha",
  yin: "Yin",
  doux: "Yoga doux",
  restauratif: "Restauratif",
  power: "Power yoga",
};

export interface ClassPlan {
  id: string;
  title: string;
  style: ClassStyle;
  /** Durée visée en minutes, comparée à la durée estimée. */
  targetMinutes: number;
  theme: string;
  intention: string;
  level: Level;
  notes: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export const LEVEL_LABELS: Record<Level, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  debout: "Debout",
  "a-genoux": "À genoux",
  assise: "Assise",
  allongee: "Allongée",
  equilibre: "Équilibre",
  "flexion-avant": "Flexion avant",
  "flexion-arriere": "Flexion arrière",
  torsion: "Torsion",
  inversion: "Inversion",
  "ouverture-hanches": "Ouverture des hanches",
  gainage: "Gainage",
  "equilibre-bras": "Équilibre sur les bras",
  restauratrice: "Restauratrice",
};

export const SIDE_LABELS: Record<Side, string> = {
  aucun: "Sans côté",
  droite: "Côté droit",
  gauche: "Côté gauche",
  "les-deux": "Les deux côtés",
};

export const SIDE_SHORT: Record<Side, string> = {
  aucun: "Face",
  droite: "Droite",
  gauche: "Gauche",
  "les-deux": "D + G",
};

export const BREATH_LABELS: Record<Breath, string> = {
  aucun: "Sans repère",
  inspire: "Inspire",
  expire: "Expire",
  respire: "Respire ici",
};
