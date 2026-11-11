import type { PoseDetails } from "../../details";

/** Fiches détaillées de la famille « inversions », par id de posture. Textes rédigés pour Flow Creator. */
export const DETAILS_INVERSIONS: Record<string, PoseDetails> = {
  "chien-tete-en-bas": {
    summary:
      "Posture emblématique en V inversé, mains et pieds au sol, bassin haut. Elle étire tout l'arrière du corps, renforce les bras et les épaules, et sert de transition et de repos actif dans les enchaînements. Légère inversion, elle place la tête sous le cœur et revitalise.",
    otherNames: ["Chien tête en bas", "Adho Mukha"],
    sanskritIast: "Adho Mukha Śvānāsana",
    pronunciation: "a-do mou-ka shva-NA-sa-na",
    sanskritMeaning: "Adho : vers le bas ; mukha : le visage ; śvāna : le chien.",
    position: "inversee",
    types: ["etirement", "renforcement"],
    typicalHold: "5 respirations dans un enchaînement, jusqu'à 1 minute en tenue",
    steps: {
      entry: [
        "Se placer à quatre pattes, mains un peu en avant des épaules, doigts écartés.",
        "Rentrer les orteils.",
        "Expirer, décoller les genoux et monter le bassin vers le haut et l'arrière.",
        "Garder d'abord les genoux fléchis pour allonger le dos, puis tendre progressivement les jambes.",
        "Laisser la tête pendre entre les bras, oreilles au niveau des bras.",
      ],
      hold: [
        "Pousser le sol avec les mains pour éloigner le bassin des poignets.",
        "Laisser les talons descendre vers le sol sans forcer.",
      ],
      exit: ["Poser les genoux au sol et s'asseoir sur les talons en posture de l'Enfant.", "Ou marcher les pieds vers les mains jusqu'à la Pince debout."],
    },
    cuesShort: ["Pousse le sol, bassin haut.", "Genoux souples, dos long.", "Talons vers le sol, sans forcer.", "Nuque relâchée entre les bras."],
    cuesDetailed: [
      { zone: "Mains", cue: "Doigts écartés, pression sur la base de l'index et du pouce pour soulager le poignet." },
      { zone: "Bras", cue: "Tendus, plis des coudes orientés l'un vers l'autre." },
      { zone: "Épaules", cue: "Larges, omoplates qui s'écartent et glissent vers le bassin." },
      { zone: "Dos", cue: "Long de la tête au coccyx ; priorité au dos sur les jambes tendues." },
      { zone: "Bassin", cue: "Ischions dirigés vers le plafond et l'arrière." },
      { zone: "Jambes", cue: "Cuisses qui poussent vers l'arrière, talons qui descendent." },
    ],
    breath: "Respiration lente et profonde ; à chaque expiration, allonger un peu plus la colonne.",
    commonMistakes: [
      "Dos arrondi pour tendre les jambes : plier les genoux.",
      "Épaules collées aux oreilles : pousser le sol et élargir le haut du dos.",
      "Poids sur les poignets : renvoyer le poids vers les jambes.",
      "Pieds trop proches des mains : allonger la posture.",
    ],
    benefitsDetailed: [
      { theme: "Étirement", text: "Étire les ischio-jambiers, les mollets, le dos et les épaules en une seule posture." },
      { theme: "Force", text: "Renforce les bras, les épaules et la sangle abdominale qui stabilise le tronc." },
      { theme: "Énergie", text: "La légère inversion favorise le retour veineux et procure une sensation de revitalisation." },
    ],
    therapeutic: ["Raideur de l'arrière des jambes", "Fatigue légère"],
    precautions:
      "Éviter ou adapter en cas de syndrome du canal carpien, de blessure à l'épaule, d'hypertension non contrôlée, de glaucome, ou en fin de grossesse. Sortir de la posture en cas de vertiges ou de maux de tête.",
    modifications: [
      "Genoux fléchis, talons hauts.",
      "Mains sur des briques ou sur une chaise pour soulager poignets et épaules.",
      "Version Dauphin, sur les avant-bras, si les poignets sont douloureux.",
    ],
    props: ["briques", "chaise", "couverture sous les talons"],
    audience: { pregnancy: "avec-adaptation", seniors: "avec-adaptation", children: "oui", note: "Grossesse : tenue courte, mains sur une chaise au 3e trimestre." },
    muscles: {
      stretched: ["ischio-jambiers", "mollets", "grand dorsal", "érecteurs du rachis"],
      strengthened: ["deltoïdes", "triceps", "dentelé antérieur", "quadriceps", "transverse de l'abdomen"],
    },
    preparatory: ["quatre-pattes", "chat", "vache", "chiot", "dauphin"],
    counterPoses: ["enfant", "chien-tete-en-haut"],
    variations: ["chien-trois-pattes", "dauphin"],
    progressions: ["planche", "chien-trois-pattes"],
    chakras: ["coeur", "gorge"],
    doshas: ["kapha"],
    elements: ["air"],
    gunas: ["rajas"],
    vayus: ["prana", "apana"],
    koshas: ["annamaya", "pranamaya"],
    styles: ["Vinyasa", "Ashtanga", "Hatha", "Power yoga", "Iyengar"],
  },
};
