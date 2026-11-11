import type { PoseDetails } from "../../details";

/** Fiches détaillées de la famille « genoux », par id de posture. Textes rédigés pour Flow Creator. */
export const DETAILS_GENOUX: Record<string, PoseDetails> = {
  enfant: {
    summary:
      "Posture de repos par excellence : assis sur les talons, buste replié sur les cuisses, front au sol. Elle allonge doucement le dos, relâche les épaules et calme la respiration. On peut y revenir à tout moment du cours pour récupérer, ce qui en fait une posture clé à proposer aux élèves.",
    otherNames: ["Posture de l'enfant", "Pose de repos"],
    sanskritIast: "Bālāsana",
    pronunciation: "ba-LA-sa-na",
    sanskritMeaning: "Bāla : l'enfant ; āsana : la posture.",
    position: "a-genoux",
    types: ["relaxation", "etirement"],
    typicalHold: "5 respirations à plusieurs minutes",
    steps: {
      entry: [
        "Se mettre à genoux, gros orteils qui se touchent.",
        "Garder les genoux joints ou les écarter de la largeur du tapis.",
        "Expirer, s'asseoir sur les talons et descendre le buste vers les cuisses.",
        "Poser le front au sol (ou sur une brique).",
        "Allonger les bras devant soi ou les poser le long du corps, paumes vers le haut.",
      ],
      hold: ["Laisser le poids du bassin descendre vers les talons.", "Sentir le dos s'élargir à chaque inspiration."],
      exit: ["Poser les mains sous les épaules.", "Remonter lentement le buste, vertèbre après vertèbre, tête en dernier."],
    },
    cuesShort: ["Fesses vers les talons.", "Front qui se pose, mâchoire relâchée.", "Respire dans le dos.", "Reviens ici dès que tu en as besoin."],
    cuesDetailed: [
      { zone: "Bassin", cue: "Lourd, il descend vers les talons ; coussin entre fesses et talons si besoin." },
      { zone: "Dos", cue: "Long et rond, il s'élargit à l'inspiration." },
      { zone: "Épaules", cue: "Relâchées ; bras le long du corps pour un repos complet." },
      { zone: "Tête", cue: "Front posé, nuque libre, sans pression sur les yeux." },
    ],
    breath: "Respiration lente vers l'arrière des côtes et le bas du dos ; laisser l'expiration s'allonger.",
    commonMistakes: [
      "Fesses loin des talons : glisser un coussin pour permettre le relâchement.",
      "Front qui n'atteint pas le sol : poser une brique plutôt que de forcer la nuque.",
    ],
    benefitsDetailed: [
      { theme: "Détente", text: "Calme le système nerveux et invite à l'intériorisation, utile après un effort ou en fin de séance." },
      { theme: "Dos", text: "Allonge doucement la colonne et relâche le bas du dos." },
      { theme: "Respiration", text: "La compression du ventre oriente le souffle vers le dos et favorise une respiration lente." },
    ],
    therapeutic: ["Stress et agitation", "Tensions du bas du dos (sans douleur aiguë)", "Fatigue"],
    precautions:
      "Adapter en cas de blessure aux genoux ou aux chevilles (coussins, couverture sous les chevilles). Pendant la grossesse, écarter largement les genoux pour laisser la place au ventre. Éviter la tête en bas prolongée en cas de pression dans les yeux.",
    modifications: [
      "Genoux écartés, buste entre les cuisses (grossesse, ventre sensible).",
      "Coussin entre les fesses et les talons.",
      "Couverture roulée sous les chevilles.",
      "Brique ou poings superposés sous le front.",
      "Version soutenue sur un traversin.",
    ],
    props: ["coussin", "traversin", "couverture", "brique"],
    audience: { pregnancy: "avec-adaptation", seniors: "avec-adaptation", children: "oui", note: "Seniors : coussins généreux sous les fesses et le front." },
    muscles: { stretched: ["érecteurs du rachis", "grand dorsal", "fessiers", "muscles du dessus du pied"] },
    preparatory: ["quatre-pattes", "diamant"],
    counterPoses: ["quatre-pattes", "chat"],
    variations: ["enfant-etendu", "enfant-soutenu", "chiot"],
    chakras: ["troisieme-oeil", "racine"],
    doshas: ["vata", "pitta"],
    elements: ["terre"],
    gunas: ["sattva", "tamas"],
    vayus: ["apana"],
    koshas: ["annamaya", "manomaya"],
    styles: ["Hatha", "Vinyasa", "Yin", "Restauratif", "Yoga doux"],
  },
};
