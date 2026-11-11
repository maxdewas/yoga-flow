import type { FigureDef } from "../figure";

/** Figurines de la famille « inversions », par id de posture. */
export const FIG_INVERSIONS: Record<string, FigureDef> = {
  // Chien et Dauphin
  "chien-tete-en-bas": { spine: 55, head: 40, armNear: [55, 55], armFar: [52, 52], legNear: [-25, -25, 80], legFar: [-22, -22, 80] },
  "chien-genoux-flechis": { spine: 65, head: 45, armNear: [50, 50], armFar: [47, 47], legNear: [15, 300, 30], legFar: [18, 302, 30] },
  "chien-trois-pattes": { spine: 55, head: 40, armNear: [55, 55], armFar: [52, 52], legNear: [235, 235, 235], legFar: [-23, -23, 80] },
  "chien-trois-pattes-hanche-ouverte": { spine: 55, head: 40, armNear: [55, 55], armFar: [52, 52], legNear: [220, 130, 130], legFar: [-23, -23, 80] },
  "chien-genou-nez": { spine: [75, 60], head: 40, armNear: [5, 5], armFar: [2, 2], legNear: [75, 300, 20], legFar: [-35, -35, 70] },
  "chien-tete-en-bas-torsion": { spine: 55, head: 20, armNear: [55, 55], armFar: [345, 335], legNear: [-25, -25, 80], legFar: [-20, -20, 80] },
  dauphin: { spine: 40, head: 25, armNear: [20, 90], armFar: [18, 90], legNear: [-35, -35, 70], legFar: [-32, -32, 70] },
  "dauphin-une-jambe": { spine: 40, head: 25, armNear: [20, 90], armFar: [18, 90], legNear: [220, 220, 220], legFar: [-34, -34, 70] },

  // Planches et équilibres de gainage
  planche: { spine: 98, head: 100, armNear: [0, 0], armFar: [-4, -4], legNear: [-80, -80, 10], legFar: [-82, -82, 10] },
  chaturanga: { spine: 95, head: 100, armNear: [280, 0], armFar: [276, 0], legNear: [-77, -77, 5], legFar: [-79, -79, 5] },
  "planche-laterale": { spine: 115, head: 115, armNear: [0, 0], armFar: [180, 180], legNear: [295, 295, 25], legFar: [297, 297, 25] },
  "chose-sauvage": { spine: [140, 170], head: 210, armNear: [0, 0], armFar: [215, 215], legNear: [300, 300, 30], legFar: [275, 0, 90] },

  // Chandelle, Charrue
  chandelle: { spine: 0, head: 272, armNear: [82, 200], armFar: [86, 200], legNear: [180, 180, 180], legFar: [178, 178, 180] },
  "demi-chandelle": { spine: 325, head: 275, armNear: [90, 175], armFar: [92, 175], legNear: [195, 195, 195], legFar: [193, 193, 195] },
  "chandelle-une-jambe": { spine: 0, head: 272, armNear: [82, 200], armFar: [86, 200], legNear: [180, 180, 180], legFar: [312, 312, 0] },
  "chandelle-sans-appui": { spine: 0, head: 272, armNear: [180, 180], armFar: [178, 178], legNear: [180, 180, 180], legFar: [178, 178, 180] },
  "chandelle-lotus": { spine: 0, head: 272, armNear: [82, 200], armFar: [86, 200], legNear: [205, 80, 80], legFar: [200, 75, 75] },
  "embryon-chandelle": { spine: 15, head: 272, armNear: [250, 160], armFar: [255, 160], legNear: [290, 140, 140], legFar: [285, 135, 135] },
  charrue: { spine: 10, head: 272, armNear: [88, 90], armFar: [90, 90], legNear: [312, 312, 0], legFar: [314, 314, 0] },
  "charrue-jambes-ecartees": { spine: 10, head: 272, armNear: [215, 290], armFar: [220, 290], legNear: [310, 310, 0], legFar: [318, 318, 0] },
  "charrue-laterale": { spine: 10, head: 272, armNear: [82, 200], armFar: [86, 200], legNear: [318, 318, 0], legFar: [320, 320, 0] },
  "oreilles-pressees": { spine: 40, head: 272, armNear: [80, 90], armFar: [82, 90], legNear: [15, 290, 0], legFar: [18, 292, 0] },

  // Poirier
  poirier: { spine: 0, head: 0, armNear: [30, 272], armFar: [26, 272], legNear: [180, 180, 180], legFar: [178, 178, 180] },
  "demi-poirier": { spine: 10, head: 0, armNear: [35, 272], armFar: [31, 272], legNear: [90, 90, 90], legFar: [88, 88, 90] },
  "poirier-une-jambe": { spine: 350, head: 0, armNear: [30, 272], armFar: [26, 272], legNear: [180, 180, 180], legFar: [18, 18, 90] },
  "poirier-lotus": { spine: 0, head: 0, armNear: [30, 272], armFar: [26, 272], legNear: [150, 275, 275], legFar: [145, 270, 270] },
  "poirier-mains-libres": { spine: 0, head: 0, armNear: [58, 58], armFar: [55, 55], legNear: [180, 180, 180], legFar: [178, 178, 180] },
  "poirier-tripode": { spine: 0, head: 0, armNear: [90, 0], armFar: [86, 0], legNear: [180, 180, 180], legFar: [178, 178, 180] },

  // Sur les mains et les avant-bras
  "arbre-droit": { spine: 0, head: 15, armNear: [0, 0], armFar: [-3, -3], legNear: [180, 180, 180], legFar: [178, 178, 180] },
  "demi-equilibre-mains-mur": { spine: 355, head: 10, armNear: [0, 0], armFar: [-3, -3], legNear: [270, 270, 180], legFar: [268, 268, 180] },
  "posture-sur-les-avant-bras": { spine: 0, head: 30, armNear: [0, 90], armFar: [-3, 90], legNear: [180, 180, 180], legFar: [178, 178, 180] },
  scorpion: { spine: [320, 350], head: 70, armNear: [0, 90], armFar: [-3, 90], legNear: [215, 45, 45], legFar: [210, 40, 40] },
  "scorpion-sur-les-mains": { spine: [320, 350], head: 60, armNear: [0, 0], armFar: [-3, -3], legNear: [215, 50, 50], legFar: [210, 45, 45] },
  "visage-formidable": { spine: [330, 0], head: 75, armNear: [270, 0], armFar: [266, 0], legNear: [215, 45, 45], legFar: [210, 40, 40] },

  // Équilibres sur les bras
  corbeau: { spine: 65, head: 80, armNear: [10, 0], armFar: [6, -2], legNear: [72, 300, 300], legFar: [68, 296, 296] },
  grue: { spine: 55, head: 70, armNear: [5, 5], armFar: [2, 2], legNear: [60, 310, 310], legFar: [56, 306, 306] },
  "corbeau-une-jambe": { spine: 65, head: 80, armNear: [10, 0], armFar: [6, -2], legNear: [72, 300, 300], legFar: [245, 245, 245] },
  "corbeau-volant": { spine: 75, head: 85, armNear: [300, 0], armFar: [296, 0], legNear: [80, 0, 0], legFar: [235, 235, 235] },
  "corbeau-lateral": { spine: 75, head: 85, armNear: [330, 0], armFar: [326, 0], legNear: [90, 330, 330], legFar: [95, 335, 335] },
  "corbeau-lateral-jambes-tendues": { spine: 85, head: 90, armNear: [300, 0], armFar: [296, 0], legNear: [265, 265, 265], legFar: [268, 268, 268] },
  "koundinya-1": { spine: 85, head: 90, armNear: [300, 0], armFar: [296, 0], legNear: [255, 255, 255], legFar: [270, 270, 270] },
  "koundinya-2": { spine: 85, head: 90, armNear: [300, 0], armFar: [296, 0], legNear: [80, 80, 80], legFar: [265, 265, 265] },
  libellule: { spine: 85, head: 90, armNear: [300, 0], armFar: [296, 0], legNear: [90, 10, 90], legFar: [265, 265, 265] },
  "huit-angles": { spine: 85, head: 95, armNear: [300, 0], armFar: [296, 0], legNear: [100, 100, 100], legFar: [104, 104, 104] },
  luciole: { spine: 50, head: 75, armNear: [0, 0], armFar: [-3, -3], legNear: [105, 105, 105], legFar: [108, 108, 108] },
  "pression-epaules": { spine: 40, head: 70, armNear: [0, 0], armFar: [-3, -3], legNear: [100, 40, 60], legFar: [103, 35, 55] },
  "jambe-sur-le-bras": { spine: 165, head: 170, armNear: [10, 0], armFar: [5, 0], legNear: [115, 115, 115], legFar: [92, 92, 92] },
  vishvamitra: { spine: 115, head: 115, armNear: [0, 0], armFar: [150, 150], legNear: [140, 140, 140], legFar: [295, 295, 25] },
  pendentif: { spine: [160, 165], head: 120, armNear: [5, 0], armFar: [2, 0], legNear: [125, 290, 290], legFar: [122, 288, 288] },
  "balance-lotus": { spine: 175, head: 180, armNear: [5, 0], armFar: [2, 0], legNear: [100, 265, 265], legFar: [96, 262, 262] },
  coq: { spine: 172, head: 178, armNear: [15, 0], armFar: [12, 0], legNear: [110, 265, 265], legFar: [106, 262, 262] },
  "coq-leve": { spine: 60, head: 80, armNear: [5, 0], armFar: [2, -2], legNear: [65, 230, 230], legFar: [62, 226, 226] },
  paon: { spine: 92, head: 95, armNear: [305, 0], armFar: [302, 0], legNear: [272, 272, 272], legFar: [270, 270, 270] },
  "paon-lotus": { spine: 85, head: 90, armNear: [305, 0], armFar: [302, 0], legNear: [285, 90, 90], legFar: [282, 85, 85] },

  // Restauratives
  "jambes-au-mur": { spine: 270, head: 270, armNear: [300, 280], armFar: [305, 285], legNear: [180, 180, 180], legFar: [178, 178, 180] },
  "jambes-au-mur-papillon": { spine: 270, head: 270, armNear: [300, 280], armFar: [305, 285], legNear: [160, 210, 210], legFar: [162, 212, 212] },
  "inversion-sur-bloc": { spine: 285, head: 270, armNear: [0, 330], armFar: [5, 330], legNear: [180, 180, 180], legFar: [178, 178, 180] },
};
