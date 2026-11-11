/**
 * Display labels of every coded value, per language. Codes are stable identifiers stored in
 * plans, edits and catalogue data; only these labels change with the language.
 */
import type { Chakra, Dosha, Element, Guna, Kosha, PoseType, Position, Suitability, Vayu } from "./details";
import type { Locale } from "./locale";
import type { Breath, Category, ClassStyle, Level, Side } from "./types";

/** Codes of the imported catalogue (see scripts/import-catalogue.py). */
export type BodyPosition =
  | "a-genoux" | "accroupie" | "alignement-lateral" | "allongee-sur-le-cote" | "assise" | "debout"
  | "dorsale-supine" | "equilibre-sur-les-bras" | "liee-bind" | "mains-aux-pieds" | "sur-le-ventre"
  | "sur-les-avant-bras" | "sur-les-orteils" | "sur-une-jambe" | "tete-epaules" | "ventrale-prone";
export type BodyZone =
  | "abdominaux-core" | "bandelette-ilio-tibiale" | "bas-du-dos" | "bassin-plancher-pelvien" | "biceps-triceps"
  | "bras-epaules" | "cou" | "extension-de-hanche" | "fessiers" | "flexion-de-hanche" | "genoux" | "hanches-ouverture"
  | "hanches-rotation-externe" | "hanches-rotation-interne" | "haut-du-dos" | "ischio-jambiers" | "milieu-du-dos"
  | "ouverture-du-coeur" | "pieds-chevilles" | "poignets" | "psoas" | "quadriceps" | "tendon-d-achille" | "yeux";
export type Therapeutic =
  | "alzheimer" | "anxiete" | "arthrose-du-genou" | "asthme" | "cervicarthrose" | "coccygodynie" | "colon-irritable-sii"
  | "crampes-nocturnes" | "cyphose" | "depression" | "desequilibre-thyroidien" | "epilepsie" | "fasciite-plantaire"
  | "fibromyalgie" | "hemorroides" | "hernie" | "immunite" | "incontinence-urinaire" | "infertilite-sopk" | "migraine"
  | "osteoporose" | "pieds-plats" | "polyarthrite-rhumatoide" | "reflux-rgo" | "schizophrenie" | "sciatique"
  | "scoliose" | "syndrome-du-canal-carpien" | "varices";
export type Audience = "ados" | "body-positive" | "enfants" | "maman-bebe" | "partenaire" | "postnatal" | "prenatal" | "seniors";
export type Prop =
  | "accessoires-mur-briques-sangles" | "aerien" | "aqua" | "backmitra" | "ballon" | "chaise" | "paddle" | "pilates" | "roue" | "rouleau";
export type PoseTag =
  | "creatif" | "echauffement" | "enchainements-flows" | "energisant" | "gros-plans" | "kriya" | "meditative" | "mudras"
  | "nouveautes" | "posture-de-base" | "pranayama" | "qigong" | "rafraichissant" | "sections-repetitions-respirations"
  | "shat-kriya" | "sukshma-vyayama" | "transition" | "uncommon-poses";
export type Meridian = "coeur-intestin-grele" | "foie-vesicule" | "poumons-gros-intestin" | "rate-estomac" | "reins-vessie";
export type Shape = "flexion-laterale";
export type AnalyticsZone = "epaules" | "bras" | "poitrine" | "abdos" | "dos" | "hanches" | "fessiers" | "ischios" | "cuisses" | "mollets";

export interface Labels {
  level: Record<Level, string>;
  category: Record<Category, string>;
  categoryShort: Partial<Record<Category, string>>;
  side: Record<Side, string>;
  sideShort: Record<Side, string>;
  breath: Record<Breath, string>;
  style: Record<ClassStyle, string>;
  position: Record<Position, string>;
  type: Record<PoseType, string>;
  suitability: Record<Suitability, string>;
  chakra: Record<Chakra, string>;
  dosha: Record<Dosha, string>;
  element: Record<Element, string>;
  guna: Record<Guna, string>;
  vayu: Record<Vayu, string>;
  kosha: Record<Kosha, string>;
  bodyPosition: Record<BodyPosition, string>;
  zone: Record<BodyZone, string>;
  therapeutic: Record<Therapeutic, string>;
  audience: Record<Audience, string>;
  prop: Record<Prop, string>;
  tag: Record<PoseTag, string>;
  meridian: Record<Meridian, string>;
  shape: Record<Shape, string>;
  analyticsZone: Record<AnalyticsZone, string>;
  family: Record<"debout" | "genoux" | "assises" | "allongees" | "inversions" | "yin", string>;
}

const fr: Labels = {
  level: { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" },
  category: {
    debout: "Debout", "a-genoux": "À genoux", assise: "Assise", allongee: "Allongée", equilibre: "Équilibre",
    "flexion-avant": "Flexion avant", "flexion-arriere": "Flexion arrière", torsion: "Torsion", inversion: "Inversion",
    "ouverture-hanches": "Ouverture des hanches", gainage: "Gainage", "equilibre-bras": "Équilibre sur les bras",
    restauratrice: "Restauratrice",
  },
  categoryShort: { "ouverture-hanches": "Hanches", "equilibre-bras": "Équilibre bras" },
  side: { aucun: "Sans côté", droite: "Côté droit", gauche: "Côté gauche", "les-deux": "Les deux côtés" },
  sideShort: { aucun: "Face", droite: "Droite", gauche: "Gauche", "les-deux": "D + G" },
  breath: { aucun: "Sans repère", inspire: "Inspire", expire: "Expire", respire: "Respire ici" },
  style: { vinyasa: "Vinyasa", hatha: "Hatha", yin: "Yin", doux: "Yoga doux", restauratif: "Restauratif", power: "Power yoga" },
  position: {
    debout: "Debout", assise: "Assise", "a-genoux": "À genoux", "quatre-pattes": "À quatre pattes", dos: "Sur le dos",
    ventre: "Sur le ventre", cote: "Sur le côté", inversee: "Inversée", mains: "Sur les mains",
  },
  type: {
    etirement: "Étirement", renforcement: "Renforcement", equilibre: "Équilibre", mobilite: "Mobilité",
    relaxation: "Relaxation", respiration: "Respiration", meditation: "Méditation",
  },
  suitability: { oui: "Oui", "avec-adaptation": "Avec adaptation", deconseille: "Déconseillé" },
  chakra: {
    racine: "Racine (Muladhara)", sacre: "Sacré (Svadhisthana)", plexus: "Plexus solaire (Manipura)", coeur: "Cœur (Anahata)",
    gorge: "Gorge (Vishuddha)", "troisieme-oeil": "Troisième œil (Ajna)", couronne: "Couronne (Sahasrara)",
  },
  dosha: { vata: "Vata", pitta: "Pitta", kapha: "Kapha" },
  element: { terre: "Terre", eau: "Eau", feu: "Feu", air: "Air", ether: "Éther" },
  guna: { sattva: "Sattva", rajas: "Rajas", tamas: "Tamas" },
  vayu: { prana: "Prana", apana: "Apana", samana: "Samana", udana: "Udana", vyana: "Vyana" },
  kosha: {
    annamaya: "Annamaya (corps physique)", pranamaya: "Pranamaya (énergie)", manomaya: "Manomaya (mental)",
    vijnanamaya: "Vijnanamaya (sagesse)", anandamaya: "Anandamaya (félicité)",
  },
  bodyPosition: {
    "a-genoux": "À genoux", accroupie: "Accroupie", "alignement-lateral": "Alignement latéral",
    "allongee-sur-le-cote": "Allongée sur le côté", assise: "Assise", debout: "Debout", "dorsale-supine": "Sur le dos",
    "equilibre-sur-les-bras": "Équilibre sur les bras", "liee-bind": "Liée (bind)", "mains-aux-pieds": "Mains aux pieds",
    "sur-le-ventre": "Sur le ventre", "sur-les-avant-bras": "Sur les avant-bras", "sur-les-orteils": "Sur les orteils",
    "sur-une-jambe": "Sur une jambe", "tete-epaules": "Sur la tête et les épaules", "ventrale-prone": "À plat ventre",
  },
  zone: {
    "abdominaux-core": "Abdominaux (centre)", "bandelette-ilio-tibiale": "Bandelette ilio-tibiale", "bas-du-dos": "Bas du dos",
    "bassin-plancher-pelvien": "Bassin et plancher pelvien", "biceps-triceps": "Biceps et triceps", "bras-epaules": "Bras et épaules",
    cou: "Cou", "extension-de-hanche": "Extension de hanche", fessiers: "Fessiers", "flexion-de-hanche": "Flexion de hanche",
    genoux: "Genoux", "hanches-ouverture": "Ouverture des hanches", "hanches-rotation-externe": "Hanches (rotation externe)",
    "hanches-rotation-interne": "Hanches (rotation interne)", "haut-du-dos": "Haut du dos", "ischio-jambiers": "Ischio-jambiers",
    "milieu-du-dos": "Milieu du dos", "ouverture-du-coeur": "Ouverture du cœur", "pieds-chevilles": "Pieds et chevilles",
    poignets: "Poignets", psoas: "Psoas", quadriceps: "Quadriceps", "tendon-d-achille": "Tendon d'Achille", yeux: "Yeux",
  },
  therapeutic: {
    alzheimer: "Maladie d'Alzheimer", anxiete: "Anxiété", "arthrose-du-genou": "Arthrose du genou", asthme: "Asthme",
    cervicarthrose: "Cervicarthrose", coccygodynie: "Douleurs du coccyx", "colon-irritable-sii": "Côlon irritable",
    "crampes-nocturnes": "Crampes nocturnes", cyphose: "Cyphose", depression: "Dépression",
    "desequilibre-thyroidien": "Déséquilibre thyroïdien", epilepsie: "Épilepsie", "fasciite-plantaire": "Fasciite plantaire",
    fibromyalgie: "Fibromyalgie", hemorroides: "Hémorroïdes", hernie: "Hernie", immunite: "Immunité",
    "incontinence-urinaire": "Incontinence urinaire", "infertilite-sopk": "Infertilité / SOPK", migraine: "Migraine",
    osteoporose: "Ostéoporose", "pieds-plats": "Pieds plats", "polyarthrite-rhumatoide": "Polyarthrite rhumatoïde",
    "reflux-rgo": "Reflux gastrique", schizophrenie: "Schizophrénie", sciatique: "Sciatique", scoliose: "Scoliose",
    "syndrome-du-canal-carpien": "Syndrome du canal carpien", varices: "Varices",
  },
  audience: {
    ados: "Ados", "body-positive": "Tous gabarits", enfants: "Enfants", "maman-bebe": "Maman & bébé", partenaire: "À deux",
    postnatal: "Postnatal", prenatal: "Prénatal", seniors: "Seniors",
  },
  prop: {
    "accessoires-mur-briques-sangles": "Mur, briques, sangles", aerien: "Hamac (aérien)", aqua: "Aqua", backmitra: "Backmitra",
    ballon: "Ballon", chaise: "Chaise", paddle: "Paddle", pilates: "Pilates", roue: "Roue de yoga", rouleau: "Rouleau",
  },
  tag: {
    creatif: "Créatif", echauffement: "Échauffement", "enchainements-flows": "Enchaînement", energisant: "Énergisant",
    "gros-plans": "Gros plan", kriya: "Kriya", meditative: "Méditative", mudras: "Mudra", nouveautes: "Nouveauté",
    "posture-de-base": "Posture de base", pranayama: "Pranayama", qigong: "Qigong", rafraichissant: "Rafraîchissant",
    "sections-repetitions-respirations": "Repère de séquence", "shat-kriya": "Shat kriya", "sukshma-vyayama": "Sukshma vyayama",
    transition: "Transition", "uncommon-poses": "Peu courante",
  },
  meridian: {
    "coeur-intestin-grele": "Cœur et intestin grêle", "foie-vesicule": "Foie et vésicule biliaire",
    "poumons-gros-intestin": "Poumons et gros intestin", "rate-estomac": "Rate et estomac", "reins-vessie": "Reins et vessie",
  },
  shape: { "flexion-laterale": "Flexion latérale" },
  analyticsZone: {
    epaules: "Épaules", bras: "Bras & poignets", poitrine: "Poitrine", abdos: "Abdominaux", dos: "Dos", hanches: "Hanches",
    fessiers: "Fessiers", ischios: "Ischio-jambiers", cuisses: "Cuisses", mollets: "Mollets & chevilles",
  },
  family: { debout: "Debout", genoux: "À genoux", assises: "Assises", allongees: "Allongées", inversions: "Inversions et bras", yin: "Yin, souffle et méditation" },
};

const en: Labels = {
  level: { debutant: "Beginner", intermediaire: "Intermediate", avance: "Advanced" },
  category: {
    debout: "Standing", "a-genoux": "Kneeling", assise: "Seated", allongee: "Lying down", equilibre: "Balance",
    "flexion-avant": "Forward bend", "flexion-arriere": "Backbend", torsion: "Twist", inversion: "Inversion",
    "ouverture-hanches": "Hip opener", gainage: "Core", "equilibre-bras": "Arm balance", restauratrice: "Restorative",
  },
  categoryShort: { "ouverture-hanches": "Hips", "equilibre-bras": "Arm balance" },
  side: { aucun: "No side", droite: "Right side", gauche: "Left side", "les-deux": "Both sides" },
  sideShort: { aucun: "Front", droite: "Right", gauche: "Left", "les-deux": "R + L" },
  breath: { aucun: "No cue", inspire: "Inhale", expire: "Exhale", respire: "Breathe here" },
  style: { vinyasa: "Vinyasa", hatha: "Hatha", yin: "Yin", doux: "Gentle yoga", restauratif: "Restorative", power: "Power yoga" },
  position: {
    debout: "Standing", assise: "Seated", "a-genoux": "Kneeling", "quatre-pattes": "On all fours", dos: "On the back",
    ventre: "On the belly", cote: "On the side", inversee: "Inverted", mains: "On the hands",
  },
  type: {
    etirement: "Stretch", renforcement: "Strength", equilibre: "Balance", mobilite: "Mobility", relaxation: "Relaxation",
    respiration: "Breathing", meditation: "Meditation",
  },
  suitability: { oui: "Yes", "avec-adaptation": "With adaptation", deconseille: "Not advised" },
  chakra: {
    racine: "Root (Muladhara)", sacre: "Sacral (Svadhisthana)", plexus: "Solar plexus (Manipura)", coeur: "Heart (Anahata)",
    gorge: "Throat (Vishuddha)", "troisieme-oeil": "Third eye (Ajna)", couronne: "Crown (Sahasrara)",
  },
  dosha: { vata: "Vata", pitta: "Pitta", kapha: "Kapha" },
  element: { terre: "Earth", eau: "Water", feu: "Fire", air: "Air", ether: "Ether" },
  guna: { sattva: "Sattva", rajas: "Rajas", tamas: "Tamas" },
  vayu: { prana: "Prana", apana: "Apana", samana: "Samana", udana: "Udana", vyana: "Vyana" },
  kosha: {
    annamaya: "Annamaya (physical body)", pranamaya: "Pranamaya (energy)", manomaya: "Manomaya (mind)",
    vijnanamaya: "Vijnanamaya (wisdom)", anandamaya: "Anandamaya (bliss)",
  },
  bodyPosition: {
    "a-genoux": "Kneeling", accroupie: "Squatting", "alignement-lateral": "Side alignment", "allongee-sur-le-cote": "Side-lying",
    assise: "Seated", debout: "Standing", "dorsale-supine": "Supine", "equilibre-sur-les-bras": "Arm balance",
    "liee-bind": "Bound", "mains-aux-pieds": "Hands to feet", "sur-le-ventre": "On the belly",
    "sur-les-avant-bras": "On the forearms", "sur-les-orteils": "On the toes", "sur-une-jambe": "On one leg",
    "tete-epaules": "On head and shoulders", "ventrale-prone": "Prone",
  },
  zone: {
    "abdominaux-core": "Abdominals (core)", "bandelette-ilio-tibiale": "IT band", "bas-du-dos": "Lower back",
    "bassin-plancher-pelvien": "Pelvis and pelvic floor", "biceps-triceps": "Biceps and triceps", "bras-epaules": "Arms and shoulders",
    cou: "Neck", "extension-de-hanche": "Hip extension", fessiers: "Glutes", "flexion-de-hanche": "Hip flexion", genoux: "Knees",
    "hanches-ouverture": "Hip opening", "hanches-rotation-externe": "Hips (external rotation)",
    "hanches-rotation-interne": "Hips (internal rotation)", "haut-du-dos": "Upper back", "ischio-jambiers": "Hamstrings",
    "milieu-du-dos": "Mid back", "ouverture-du-coeur": "Heart opening", "pieds-chevilles": "Feet and ankles", poignets: "Wrists",
    psoas: "Psoas", quadriceps: "Quadriceps", "tendon-d-achille": "Achilles tendon", yeux: "Eyes",
  },
  therapeutic: {
    alzheimer: "Alzheimer's disease", anxiete: "Anxiety", "arthrose-du-genou": "Knee osteoarthritis", asthme: "Asthma",
    cervicarthrose: "Cervical spondylosis", coccygodynie: "Tailbone pain", "colon-irritable-sii": "Irritable bowel",
    "crampes-nocturnes": "Night cramps", cyphose: "Kyphosis", depression: "Depression",
    "desequilibre-thyroidien": "Thyroid imbalance", epilepsie: "Epilepsy", "fasciite-plantaire": "Plantar fasciitis",
    fibromyalgie: "Fibromyalgia", hemorroides: "Haemorrhoids", hernie: "Hernia", immunite: "Immunity",
    "incontinence-urinaire": "Urinary incontinence", "infertilite-sopk": "Infertility / PCOS", migraine: "Migraine",
    osteoporose: "Osteoporosis", "pieds-plats": "Flat feet", "polyarthrite-rhumatoide": "Rheumatoid arthritis",
    "reflux-rgo": "Acid reflux", schizophrenie: "Schizophrenia", sciatique: "Sciatica", scoliose: "Scoliosis",
    "syndrome-du-canal-carpien": "Carpal tunnel syndrome", varices: "Varicose veins",
  },
  audience: {
    ados: "Teens", "body-positive": "All body types", enfants: "Kids", "maman-bebe": "Mum & baby", partenaire: "Partner",
    postnatal: "Postnatal", prenatal: "Prenatal", seniors: "Seniors",
  },
  prop: {
    "accessoires-mur-briques-sangles": "Wall, blocks, straps", aerien: "Aerial hammock", aqua: "Aqua",
    backmitra: "Backmitra", ballon: "Ball", chaise: "Chair", paddle: "Paddle", pilates: "Pilates", roue: "Yoga wheel",
    rouleau: "Roller",
  },
  tag: {
    creatif: "Creative", echauffement: "Warm-up", "enchainements-flows": "Flow", energisant: "Energising", "gros-plans": "Close-up",
    kriya: "Kriya", meditative: "Meditative", mudras: "Mudra", nouveautes: "New", "posture-de-base": "Base pose",
    pranayama: "Pranayama", qigong: "Qigong", rafraichissant: "Cooling", "sections-repetitions-respirations": "Sequence marker",
    "shat-kriya": "Shat kriya", "sukshma-vyayama": "Sukshma vyayama", transition: "Transition", "uncommon-poses": "Uncommon",
  },
  meridian: {
    "coeur-intestin-grele": "Heart and small intestine", "foie-vesicule": "Liver and gallbladder",
    "poumons-gros-intestin": "Lungs and large intestine", "rate-estomac": "Spleen and stomach", "reins-vessie": "Kidneys and bladder",
  },
  shape: { "flexion-laterale": "Side bend" },
  analyticsZone: {
    epaules: "Shoulders", bras: "Arms & wrists", poitrine: "Chest", abdos: "Abs", dos: "Back", hanches: "Hips",
    fessiers: "Glutes", ischios: "Hamstrings", cuisses: "Thighs", mollets: "Calves & ankles",
  },
  family: { debout: "Standing", genoux: "Kneeling", assises: "Seated", allongees: "Lying down", inversions: "Inversions & arm balances", yin: "Yin, breath & meditation" },
};

const es: Labels = {
  level: { debutant: "Principiante", intermediaire: "Intermedio", avance: "Avanzado" },
  category: {
    debout: "De pie", "a-genoux": "De rodillas", assise: "Sentada", allongee: "Tumbada", equilibre: "Equilibrio",
    "flexion-avant": "Flexión hacia delante", "flexion-arriere": "Extensión (flexión atrás)", torsion: "Torsión",
    inversion: "Inversión", "ouverture-hanches": "Apertura de caderas", gainage: "Core", "equilibre-bras": "Equilibrio sobre brazos",
    restauratrice: "Restaurativa",
  },
  categoryShort: { "ouverture-hanches": "Caderas", "equilibre-bras": "Equil. brazos", "flexion-avant": "Flexión delante", "flexion-arriere": "Flexión atrás" },
  side: { aucun: "Sin lado", droite: "Lado derecho", gauche: "Lado izquierdo", "les-deux": "Ambos lados" },
  sideShort: { aucun: "Frente", droite: "Derecha", gauche: "Izquierda", "les-deux": "D + I" },
  breath: { aucun: "Sin indicación", inspire: "Inhala", expire: "Exhala", respire: "Respira aquí" },
  style: { vinyasa: "Vinyasa", hatha: "Hatha", yin: "Yin", doux: "Yoga suave", restauratif: "Restaurativo", power: "Power yoga" },
  position: {
    debout: "De pie", assise: "Sentada", "a-genoux": "De rodillas", "quatre-pattes": "En cuadrupedia", dos: "Boca arriba",
    ventre: "Boca abajo", cote: "De lado", inversee: "Invertida", mains: "Sobre las manos",
  },
  type: {
    etirement: "Estiramiento", renforcement: "Fortalecimiento", equilibre: "Equilibrio", mobilite: "Movilidad",
    relaxation: "Relajación", respiration: "Respiración", meditation: "Meditación",
  },
  suitability: { oui: "Sí", "avec-adaptation": "Con adaptación", deconseille: "Desaconsejado" },
  chakra: {
    racine: "Raíz (Muladhara)", sacre: "Sacro (Svadhisthana)", plexus: "Plexo solar (Manipura)", coeur: "Corazón (Anahata)",
    gorge: "Garganta (Vishuddha)", "troisieme-oeil": "Tercer ojo (Ajna)", couronne: "Corona (Sahasrara)",
  },
  dosha: { vata: "Vata", pitta: "Pitta", kapha: "Kapha" },
  element: { terre: "Tierra", eau: "Agua", feu: "Fuego", air: "Aire", ether: "Éter" },
  guna: { sattva: "Sattva", rajas: "Rajas", tamas: "Tamas" },
  vayu: { prana: "Prana", apana: "Apana", samana: "Samana", udana: "Udana", vyana: "Vyana" },
  kosha: {
    annamaya: "Annamaya (cuerpo físico)", pranamaya: "Pranamaya (energía)", manomaya: "Manomaya (mente)",
    vijnanamaya: "Vijnanamaya (sabiduría)", anandamaya: "Anandamaya (dicha)",
  },
  bodyPosition: {
    "a-genoux": "De rodillas", accroupie: "En cuclillas", "alignement-lateral": "Alineación lateral",
    "allongee-sur-le-cote": "Tumbada de lado", assise: "Sentada", debout: "De pie", "dorsale-supine": "Boca arriba",
    "equilibre-sur-les-bras": "Equilibrio sobre brazos", "liee-bind": "Con agarre (bind)", "mains-aux-pieds": "Manos a los pies",
    "sur-le-ventre": "Sobre el vientre", "sur-les-avant-bras": "Sobre los antebrazos", "sur-les-orteils": "De puntillas",
    "sur-une-jambe": "Sobre una pierna", "tete-epaules": "Sobre cabeza y hombros", "ventrale-prone": "Boca abajo",
  },
  zone: {
    "abdominaux-core": "Abdominales (core)", "bandelette-ilio-tibiale": "Cintilla iliotibial", "bas-du-dos": "Zona lumbar",
    "bassin-plancher-pelvien": "Pelvis y suelo pélvico", "biceps-triceps": "Bíceps y tríceps", "bras-epaules": "Brazos y hombros",
    cou: "Cuello", "extension-de-hanche": "Extensión de cadera", fessiers: "Glúteos", "flexion-de-hanche": "Flexión de cadera",
    genoux: "Rodillas", "hanches-ouverture": "Apertura de caderas", "hanches-rotation-externe": "Caderas (rotación externa)",
    "hanches-rotation-interne": "Caderas (rotación interna)", "haut-du-dos": "Espalda alta", "ischio-jambiers": "Isquiotibiales",
    "milieu-du-dos": "Espalda media", "ouverture-du-coeur": "Apertura del corazón", "pieds-chevilles": "Pies y tobillos",
    poignets: "Muñecas", psoas: "Psoas", quadriceps: "Cuádriceps", "tendon-d-achille": "Tendón de Aquiles", yeux: "Ojos",
  },
  therapeutic: {
    alzheimer: "Alzheimer", anxiete: "Ansiedad", "arthrose-du-genou": "Artrosis de rodilla", asthme: "Asma",
    cervicarthrose: "Cervicoartrosis", coccygodynie: "Dolor de coxis", "colon-irritable-sii": "Colon irritable",
    "crampes-nocturnes": "Calambres nocturnos", cyphose: "Cifosis", depression: "Depresión",
    "desequilibre-thyroidien": "Desequilibrio tiroideo", epilepsie: "Epilepsia", "fasciite-plantaire": "Fascitis plantar",
    fibromyalgie: "Fibromialgia", hemorroides: "Hemorroides", hernie: "Hernia", immunite: "Inmunidad",
    "incontinence-urinaire": "Incontinencia urinaria", "infertilite-sopk": "Infertilidad / SOP", migraine: "Migraña",
    osteoporose: "Osteoporosis", "pieds-plats": "Pies planos", "polyarthrite-rhumatoide": "Artritis reumatoide",
    "reflux-rgo": "Reflujo gástrico", schizophrenie: "Esquizofrenia", sciatique: "Ciática", scoliose: "Escoliosis",
    "syndrome-du-canal-carpien": "Síndrome del túnel carpiano", varices: "Varices",
  },
  audience: {
    ados: "Adolescentes", "body-positive": "Todos los cuerpos", enfants: "Niños", "maman-bebe": "Mamá y bebé",
    partenaire: "En pareja", postnatal: "Posparto", prenatal: "Prenatal", seniors: "Mayores",
  },
  prop: {
    "accessoires-mur-briques-sangles": "Pared, bloques, correas", aerien: "Hamaca (aéreo)", aqua: "Aqua", backmitra: "Backmitra",
    ballon: "Pelota", chaise: "Silla", paddle: "Paddle", pilates: "Pilates", roue: "Rueda de yoga", rouleau: "Rodillo",
  },
  tag: {
    creatif: "Creativa", echauffement: "Calentamiento", "enchainements-flows": "Secuencia", energisant: "Energizante",
    "gros-plans": "Primer plano", kriya: "Kriya", meditative: "Meditativa", mudras: "Mudra", nouveautes: "Novedad",
    "posture-de-base": "Postura base", pranayama: "Pranayama", qigong: "Qigong", rafraichissant: "Refrescante",
    "sections-repetitions-respirations": "Marcador de secuencia", "shat-kriya": "Shat kriya", "sukshma-vyayama": "Sukshma vyayama",
    transition: "Transición", "uncommon-poses": "Poco común",
  },
  meridian: {
    "coeur-intestin-grele": "Corazón e intestino delgado", "foie-vesicule": "Hígado y vesícula biliar",
    "poumons-gros-intestin": "Pulmones e intestino grueso", "rate-estomac": "Bazo y estómago", "reins-vessie": "Riñones y vejiga",
  },
  shape: { "flexion-laterale": "Flexión lateral" },
  analyticsZone: {
    epaules: "Hombros", bras: "Brazos y muñecas", poitrine: "Pecho", abdos: "Abdominales", dos: "Espalda", hanches: "Caderas",
    fessiers: "Glúteos", ischios: "Isquiotibiales", cuisses: "Muslos", mollets: "Gemelos y tobillos",
  },
  family: { debout: "De pie", genoux: "De rodillas", assises: "Sentadas", allongees: "Tumbadas", inversions: "Inversiones y brazos", yin: "Yin, respiración y meditación" },
};

export const LABELS: Record<Locale, Labels> = { fr, en, es };

/** Joins the labels of coded values, keeping unknown codes visible rather than dropping them. */
export const joinLabels = <T extends string>(values: readonly T[] | undefined, map: Partial<Record<T, string>>) =>
  values?.length ? values.map((v) => map[v] ?? v).join(", ") : null;
