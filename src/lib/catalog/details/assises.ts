import type { PoseDetails } from "../../details";

/** Fiches détaillées de la famille « assises », par id de posture. Textes rédigés pour Flow Creator. */
export const DETAILS_ASSISES: Record<string, PoseDetails> = {
  pigeon: {
    summary:
      "Ouverture de hanche profonde : la jambe avant repliée devant soi, la jambe arrière allongée. Elle étire les rotateurs de la hanche et les fessiers d'un côté, les fléchisseurs de hanche de l'autre. Pratiquée buste droit, elle est active ; buste posé vers l'avant, elle devient une posture de lâcher-prise.",
    otherNames: ["Pigeon (préparation)", "Demi-pigeon"],
    sanskritIast: "Eka Pāda Kapotāsana (préparation)",
    pronunciation: "é-ka pa-da ka-po-TA-sa-na",
    sanskritMeaning: "Eka : un ; pāda : la jambe ; kapota : le pigeon.",
    position: "assise",
    types: ["etirement"],
    typicalHold: "8 à 15 respirations de chaque côté, jusqu'à 3 minutes en version yin",
    steps: {
      entry: [
        "Depuis le Chien tête en bas ou à quatre pattes, avancer un genou derrière le poignet du même côté.",
        "Poser le tibia avant au sol, pied vers le poignet opposé (plus ou moins parallèle au bord du tapis selon l'ouverture).",
        "Allonger la jambe arrière, dessus du pied au sol.",
        "Ramener le bassin d'équerre et le laisser descendre ; caler une couverture sous la fesse avant si elle ne touche pas.",
        "Grandir le buste à l'inspiration, puis, si c'est confortable, descendre vers l'avant sur les avant-bras ou le front.",
      ],
      hold: ["Garder le pied avant actif (flexé) pour protéger le genou.", "Respirer dans la hanche sans chercher à forcer."],
      exit: ["Revenir mains sous les épaules, rentrer les orteils arrière.", "Repasser à quatre pattes ou en Chien tête en bas et changer de côté."],
    },
    cuesShort: ["Genou avant derrière le poignet.", "Pied avant actif, orteils écartés.", "Bassin d'équerre, il descend.", "Respire dans la hanche, sans forcer."],
    cuesDetailed: [
      { zone: "Genou avant", cue: "Aucune douleur ; rapprocher le pied du bassin si le genou tire." },
      { zone: "Pied avant", cue: "Flexé pour stabiliser le genou." },
      { zone: "Bassin", cue: "Les deux crêtes iliaques face à l'avant ; soutien sous la fesse avant si besoin." },
      { zone: "Jambe arrière", cue: "Allongée droit derrière la hanche, cuisse qui tourne vers le sol." },
      { zone: "Buste", cue: "Long avant de descendre ; en flexion avant, laisser la tête se poser." },
    ],
    breath: "Respiration lente ; à chaque expiration, laisser le bassin descendre de quelques millimètres.",
    commonMistakes: [
      "Bassin qui bascule sur la fesse avant : glisser une couverture dessous.",
      "Genou avant qui tire ou fait mal : fermer l'angle du tibia ou passer au Chiffre 4 allongé.",
      "Jambe arrière déviée vers l'extérieur : la réaligner derrière la hanche.",
    ],
    benefitsDetailed: [
      { theme: "Hanches", text: "Étire les rotateurs externes et les fessiers de la jambe avant, souvent raides chez les coureurs et les personnes assises longtemps." },
      { theme: "Avant du corps", text: "Étire les fléchisseurs de hanche de la jambe arrière." },
      { theme: "Lâcher-prise", text: "En version penchée vers l'avant, invite à la patience et au relâchement, souvent associé aux hanches dans les traditions du yoga." },
    ],
    therapeutic: ["Raideur des hanches", "Tensions des fessiers et du piriforme (sans douleur sciatique aiguë)"],
    precautions:
      "Éviter en cas de blessure ou de prothèse du genou ou de la hanche, et adapter en cas de douleur sacro-iliaque. Toute douleur au genou est un signal d'arrêt : proposer le Chiffre 4 allongé à la place.",
    modifications: [
      "Couverture ou brique sous la fesse avant.",
      "Tibia avant plus proche du bassin.",
      "Version allongée sur le dos (Chiffre 4) pour soulager les genoux.",
      "Traversin sous le buste en version penchée.",
    ],
    props: ["couverture", "brique", "traversin"],
    audience: { pregnancy: "avec-adaptation", seniors: "avec-adaptation", children: "oui", note: "Grossesse : rester buste droit, soutien sous la hanche." },
    muscles: { stretched: ["piriforme", "grand fessier", "moyen fessier", "psoas-iliaque de la jambe arrière", "droit fémoral"] },
    preparatory: ["chiffre-quatre", "lezard", "fente-basse", "papillon"],
    counterPoses: ["chien-tete-en-bas", "enfant", "pince-assise"],
    variations: ["yin-cygne", "yin-cygne-endormi", "double-pigeon"],
    progressions: ["roi-pigeon"],
    chakras: ["sacre"],
    doshas: ["vata"],
    elements: ["eau"],
    gunas: ["tamas"],
    vayus: ["apana"],
    koshas: ["annamaya", "manomaya"],
    styles: ["Vinyasa", "Hatha", "Yin"],
  },
};
