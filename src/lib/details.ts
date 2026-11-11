/**
 * Fiche détaillée d'une posture : tout ce qu'une prof peut vouloir consulter ou compléter.
 * Tous les champs sont facultatifs : une fiche se remplit progressivement (catalogue + modifications de la prof).
 * Les liens vers d'autres postures sont des ids du catalogue.
 */

import type { Audience, BodyPosition, BodyZone, PoseTag, Prop, Shape } from "./labels";

export type Position = "debout" | "assise" | "a-genoux" | "quatre-pattes" | "dos" | "ventre" | "cote" | "inversee" | "mains";
export type PoseType = "etirement" | "renforcement" | "equilibre" | "mobilite" | "relaxation" | "respiration" | "meditation";
export type Suitability = "oui" | "avec-adaptation" | "deconseille";
export type Chakra = "racine" | "sacre" | "plexus" | "coeur" | "gorge" | "troisieme-oeil" | "couronne";
export type Dosha = "vata" | "pitta" | "kapha";
export type Element = "terre" | "eau" | "feu" | "air" | "ether";
export type Guna = "sattva" | "rajas" | "tamas";
export type Vayu = "prana" | "apana" | "samana" | "udana" | "vyana";
export type Kosha = "annamaya" | "pranamaya" | "manomaya" | "vijnanamaya" | "anandamaya";

export interface PoseDetails {
  /** Aperçu : ce qu'est la posture, ce qu'elle travaille, à qui elle s'adresse. */
  summary?: string;
  otherNames?: string[];
  /** Translittération avec diacritiques, ex. « Adho Mukha Śvānāsana ». */
  sanskritIast?: string;
  /** Prononciation approximative, ex. « a-do mou-ka shva-NA-sa-na ». */
  pronunciation?: string;
  /** Sens littéral du nom sanskrit. */
  sanskritMeaning?: string;
  position?: Position;
  types?: PoseType[];
  /** Tenue habituelle, ex. « 5 à 8 respirations ». */
  typicalHold?: string;

  steps?: { entry?: string[]; hold?: string[]; exit?: string[] };
  /** Consignes courtes, prêtes à dire en cours. */
  cuesShort?: string[];
  /** Consignes détaillées, par zone du corps. */
  cuesDetailed?: { zone: string; cue: string }[];
  breath?: string;
  /** Erreurs fréquentes et comment les corriger. */
  commonMistakes?: string[];

  /** Bienfaits développés par thème (la liste courte reste dans `benefits`). */
  benefitsDetailed?: { theme: string; text: string }[];
  /** Précautions développées (la liste courte reste dans `contraindications`). */
  precautions?: string;
  /** Adaptations pour rendre la posture accessible. */
  modifications?: string[];
  props?: string[];
  audience?: { pregnancy?: Suitability; seniors?: Suitability; children?: Suitability; note?: string };
  /** Indications de yoga thérapeutique, formulées prudemment (accompagnement, pas soin). */
  therapeutic?: string[];
  muscles?: { stretched?: string[]; strengthened?: string[] };

  /** Liens vers d'autres postures du catalogue (ids). */
  preparatory?: string[];
  counterPoses?: string[];
  variations?: string[];
  progressions?: string[];

  /** Repères traditionnels (facultatifs, selon les écoles). */
  chakras?: Chakra[];
  doshas?: Dosha[];
  elements?: Element[];
  gunas?: Guna[];
  vayus?: Vayu[];
  koshas?: Kosha[];
  meridians?: string[];
  styles?: string[];

  /** Faits du catalogue importé (codes, libellés selon la langue). */
  bodyPositions?: BodyPosition[];
  zones?: BodyZone[];
  audiences?: Audience[];
  /** Matériel ou pratique particulière (chaise, hamac, aqua…). */
  equipment?: Prop[];
  tags?: PoseTag[];
  shapes?: Shape[];
  /** Rang de popularité dans le catalogue importé (1 = la plus utilisée). */
  popularityRank?: number;
  /** Postures souvent placées juste avant / juste après, avec leur fréquence (%). */
  oftenBefore?: { id: string; pct: number }[];
  oftenAfter?: { id: string; pct: number }[];
}

/** Merges a teacher's edits over the catalog details (field by field; lists are replaced, not concatenated). */
export function mergeDetails(base: PoseDetails | undefined, edit: PoseDetails | undefined): PoseDetails | undefined {
  if (!edit) return base;
  return { ...base, ...edit };
}
