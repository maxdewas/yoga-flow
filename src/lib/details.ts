/**
 * Fiche détaillée d'une posture : tout ce qu'une prof peut vouloir consulter ou compléter.
 * Tous les champs sont facultatifs : une fiche se remplit progressivement (catalogue + modifications de la prof).
 * Les liens vers d'autres postures sont des ids du catalogue.
 */

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
}

export const POSITION_LABELS: Record<Position, string> = {
  debout: "Debout",
  assise: "Assise",
  "a-genoux": "À genoux",
  "quatre-pattes": "À quatre pattes",
  dos: "Sur le dos",
  ventre: "Sur le ventre",
  cote: "Sur le côté",
  inversee: "Inversée",
  mains: "Sur les mains",
};
export const TYPE_LABELS: Record<PoseType, string> = {
  etirement: "Étirement",
  renforcement: "Renforcement",
  equilibre: "Équilibre",
  mobilite: "Mobilité",
  relaxation: "Relaxation",
  respiration: "Respiration",
  meditation: "Méditation",
};
export const SUITABILITY_LABELS: Record<Suitability, string> = {
  oui: "Oui",
  "avec-adaptation": "Avec adaptation",
  deconseille: "Déconseillé",
};
export const CHAKRA_LABELS: Record<Chakra, string> = {
  racine: "Racine (Muladhara)",
  sacre: "Sacré (Svadhisthana)",
  plexus: "Plexus solaire (Manipura)",
  coeur: "Cœur (Anahata)",
  gorge: "Gorge (Vishuddha)",
  "troisieme-oeil": "Troisième œil (Ajna)",
  couronne: "Couronne (Sahasrara)",
};
export const DOSHA_LABELS: Record<Dosha, string> = { vata: "Vata", pitta: "Pitta", kapha: "Kapha" };
export const ELEMENT_LABELS: Record<Element, string> = { terre: "Terre", eau: "Eau", feu: "Feu", air: "Air", ether: "Éther" };
export const GUNA_LABELS: Record<Guna, string> = { sattva: "Sattva", rajas: "Rajas", tamas: "Tamas" };
export const VAYU_LABELS: Record<Vayu, string> = { prana: "Prana", apana: "Apana", samana: "Samana", udana: "Udana", vyana: "Vyana" };
export const KOSHA_LABELS: Record<Kosha, string> = {
  annamaya: "Annamaya (corps physique)",
  pranamaya: "Pranamaya (énergie)",
  manomaya: "Manomaya (mental)",
  vijnanamaya: "Vijnanamaya (sagesse)",
  anandamaya: "Anandamaya (félicité)",
};

/** Merges a teacher's edits over the catalog details (field by field; lists are replaced, not concatenated). */
export function mergeDetails(base: PoseDetails | undefined, edit: PoseDetails | undefined): PoseDetails | undefined {
  if (!edit) return base;
  return { ...base, ...edit };
}
