/**
 * Mannequin articulé pour dessiner les postures.
 *
 * Angles absolus en degrés, dans le plan du dessin :
 *   0 = vers le bas, 90 = vers la droite (l'avant du corps en vue de profil), 180 = vers le haut, 270 = vers la gauche.
 * Le bassin est l'origine ; la figure est ensuite recadrée et posée sur le tapis (point le plus bas).
 * Méthode complète et postures de référence : .claude/skills/yoga-figures/SKILL.md
 */
export type Limb = [upper: number, lower: number];
export type Leg = [thigh: number, shin: number, foot?: number];

export interface FigureDef {
  /** Colonne : un angle, ou [lombaires, dorsales] pour une colonne courbée. */
  spine: number | [number, number];
  /** Direction cou → tête ; par défaut dans le prolongement des dorsales. */
  head?: number;
  /** Membres côté spectateur (foncés) puis côté opposé (clairs). */
  armNear: Limb;
  armFar: Limb;
  legNear: Leg;
  legFar: Leg;
  /** Retourne le dessin horizontalement. */
  flip?: boolean;
  /** Pas de tapis (ex. postures sur chaise, ou suspendues). */
  noMat?: boolean;
  /** Vue de face : pas de chignon (la tête est vue de face). */
  front?: boolean;
}

/** Longueurs des segments (unités du dessin). */
export const SEG = {
  lumbar: 23,
  thoracic: 24,
  neck: 6,
  head: 10,
  upperArm: 25,
  forearm: 23,
  thigh: 35,
  shin: 33,
  foot: 10,
};

/** Demi-épaisseurs aux articulations : donnent la silhouette (membres affinés vers les extrémités). */
const R = {
  pelvis: 8.2,
  waist: 6.9,
  chest: 9,
  neck: 3.4,
  shoulder: 4.4,
  elbow: 3.4,
  wrist: 2.6,
  hand: 3.3,
  hip: 6.5,
  knee: 4.5,
  ankle: 3.1,
  toe: 2.1,
  bun: 4.6,
};

type Pt = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const step = ([x, y]: Pt, angle: number, len: number): Pt => [x + Math.sin(rad(angle)) * len, y + Math.cos(rad(angle)) * len];
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/**
 * Teintes du personnage (couleurs dans les variables CSS --fig-*).
 * Les membres du côté opposé utilisent la variante « Far », un ton plus sombre.
 */
export type Paint = "skin" | "skinFar" | "pants" | "pantsFar" | "top" | "hair";
/** A filled shape: a tapered capsule (polygon) or a circle. */
export type Shape = { kind: "poly"; points: Pt[]; paint: Paint } | { kind: "circle"; c: Pt; r: number; paint: Paint };

export interface FigureGeometry {
  shapes: Shape[];
  viewBox: [number, number, number, number];
  groundY: number;
  matX: [number, number];
}

/** Tapered capsule from a (radius ra) to b (radius rb): body plus round ends. */
function capsule(a: Pt, ra: number, b: Pt, rb: number, paint: Paint): Shape[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const [nx, ny] = [-dy / len, dx / len];
  return [
    {
      kind: "poly",
      paint,
      points: [
        [a[0] + nx * ra, a[1] + ny * ra],
        [b[0] + nx * rb, b[1] + ny * rb],
        [b[0] - nx * rb, b[1] - ny * rb],
        [a[0] - nx * ra, a[1] - ny * ra],
      ],
    },
    { kind: "circle", c: a, r: ra, paint },
    { kind: "circle", c: b, r: rb, paint },
  ];
}

/** Mean direction (degrees) of two angles, used to let the ponytail hang between "behind" and gravity. */
function blend(a: number, b: number, w: number): number {
  const x = Math.sin(rad(a)) * (1 - w) + Math.sin(rad(b)) * w;
  const y = Math.cos(rad(a)) * (1 - w) + Math.cos(rad(b)) * w;
  return (Math.atan2(x, y) * 180) / Math.PI;
}

export function buildFigure(def: FigureDef): FigureGeometry {
  const [lowerSpine, upperSpine] = typeof def.spine === "number" ? [def.spine, def.spine] : def.spine;
  const hip: Pt = [0, 0];
  const lumbar = step(hip, lowerSpine, SEG.lumbar);
  const chest = step(lumbar, upperSpine, SEG.thoracic);
  const headAngle = def.head ?? upperSpine;
  const neckTop = step(chest, headAngle, SEG.neck);
  const headR = SEG.head * 0.95;
  const headCenter = step(neckTop, headAngle, SEG.head * 0.85);
  const shoulder = step(lumbar, upperSpine, SEG.thoracic - 4);

  // Front view: explicit, or detected when the two thighs open symmetrically to either side
  // (crossed legs, butterfly, wide stances). Shoulders and hips then sit apart and the torso is wider.
  const thighSum = ((def.legNear[0] + def.legFar[0]) % 360 + 540) % 360 - 180;
  const splay = Math.abs(Math.sin(rad(def.legNear[0]))) + Math.abs(Math.sin(rad(def.legFar[0])));
  const isFront = def.front ?? (Math.abs(thighSum) < 30 && splay > 0.8 && Math.cos(rad(upperSpine)) < -0.7);
  const wide = isFront ? 1.3 : 1;
  /** Root of a limb: in front view, shifted to the side the limb points to. */
  const root = (base: Pt, spineAngle: number, limbAngle: number, half: number, fallback: 1 | -1): Pt => {
    if (!isFront) return base;
    const perp = spineAngle - 90; // to the figure's right in the drawing when upright
    const dot = Math.sin(rad(limbAngle)) * Math.sin(rad(perp)) + Math.cos(rad(limbAngle)) * Math.cos(rad(perp));
    const side = Math.abs(dot) < 0.2 ? fallback : Math.sign(dot);
    return step(base, perp, half * side);
  };

  // The face looks 90° clockwise from the head direction; hair and ponytail sit at the back.
  const back = headAngle + 90;
  const hairCap = step(step(headCenter, back, 2.2), headAngle, 1.6);
  const tieAt = step(step(headCenter, back, headR * 0.9), headAngle, headR * 0.35);
  const ponyDir = blend(back, 0, 0.55);
  const ponyMid = step(tieAt, ponyDir, 9);
  const ponyEnd = step(ponyMid, blend(ponyDir, 0, 0.5), 9);
  const face = step(headCenter, back + 180, 1.4);

  const arm = ([u, l]: Limb, fallback: 1 | -1) => {
    const start = root(shoulder, upperSpine, u, 9, fallback);
    const elbow = step(start, u, SEG.upperArm);
    const wrist = step(elbow, l, SEG.forearm);
    return { start, elbow, wrist, hand: step(wrist, l, 2.5) };
  };
  const leg = ([t, s, f]: Leg, fallback: 1 | -1) => {
    const start = root(hip, lowerSpine, t, 5, fallback);
    const knee = step(start, t, SEG.thigh);
    const ankle = step(knee, s, SEG.shin);
    return { start, knee, ankle, toe: step(ankle, f ?? s + 90, SEG.foot) };
  };

  const limbShapes = (side: "near" | "far") => {
    const skin: Paint = side === "near" ? "skin" : "skinFar";
    const pants: Paint = side === "near" ? "pants" : "pantsFar";
    const fallback = side === "near" ? 1 : -1;
    const a = arm(side === "near" ? def.armNear : def.armFar, fallback);
    const l = leg(side === "near" ? def.legNear : def.legFar, fallback);
    return {
      arm: [
        ...capsule(a.start, R.shoulder, a.elbow, R.elbow, skin),
        ...capsule(a.elbow, R.elbow, a.wrist, R.wrist, skin),
        { kind: "circle", c: a.hand, r: R.hand, paint: skin } as Shape,
      ],
      leg: [
        ...capsule(l.start, R.hip, l.knee, R.knee, pants),
        ...capsule(l.knee, R.knee, l.ankle, R.ankle, pants),
        ...capsule(l.ankle, R.ankle * 0.95, l.toe, R.toe, skin),
      ],
    };
  };

  // Torso: leggings over the pelvis, a strip of bare waist, then a crop top over the chest.
  const waistTop = lerp(lumbar, chest, 0.3);
  const pantsTop = lerp(hip, lumbar, 0.55);
  const [rPelvis, rWaist, rChest] = [R.pelvis * wide, R.waist * wide, R.chest * wide];
  const rAt = (t: number) => rWaist + (rChest - rWaist) * t;
  const torso: Shape[] = [
    ...capsule(lumbar, rWaist, chest, rChest, "skin"),
    ...capsule(hip, rPelvis, lumbar, rWaist, "skin"),
    ...capsule(hip, rPelvis, pantsTop, (rPelvis + rWaist) / 2, "pants"),
    ...capsule(waistTop, rAt(0.3), chest, rChest, "top"),
  ];

  const head: Shape[] = isFront
    ? [
        { kind: "circle", c: step(headCenter, headAngle, 1.8), r: headR * 1.02, paint: "hair" },
        { kind: "circle", c: step(headCenter, headAngle + 180, 1.2), r: headR * 0.86, paint: "skin" },
        { kind: "circle", c: step(headCenter, headAngle, headR + 2.5), r: R.bun, paint: "hair" },
      ]
    : [
        // Lying on the back, the ponytail rests under the head: don't draw it through the mat.
        ...(Math.cos(rad(back)) > 0.6
          ? []
          : [...capsule(tieAt, 3.4, ponyMid, 3, "hair"), ...capsule(ponyMid, 3, ponyEnd, 1.6, "hair")]),
        { kind: "circle", c: hairCap, r: headR, paint: "hair" },
        { kind: "circle", c: face, r: headR * 0.84, paint: "skin" },
      ];

  const near = limbShapes("near");
  const far = limbShapes("far");
  let shapes: Shape[] = [
    ...far.arm,
    ...far.leg,
    ...capsule(chest, R.neck, neckTop, R.neck, "skin"),
    ...torso,
    ...head,
    ...near.leg,
    ...near.arm,
  ];

  if (def.flip) {
    const m = ([x, y]: Pt): Pt => [-x, y];
    shapes = shapes.map((s) => (s.kind === "circle" ? { ...s, c: m(s.c) } : { ...s, points: s.points.map(m) }));
  }

  // Bounding box over every shape (polygons are covered by their end circles).
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let groundY = -Infinity;
  for (const s of shapes) {
    const pts: [Pt, number][] = s.kind === "circle" ? [[s.c, s.r]] : s.points.map((p) => [p, 0]);
    for (const [[x, y], r] of pts) {
      minX = Math.min(minX, x - r);
      maxX = Math.max(maxX, x + r);
      minY = Math.min(minY, y - r);
      if (s.paint !== "hair") groundY = Math.max(groundY, y + r);
    }
  }
  // The mat sits under the body (hair excluded); the frame still includes any hair hanging lower.
  const pad = 9;
  const bottom = Math.max(groundY, ...shapes.filter((s) => s.paint === "hair").map((s) => (s.kind === "circle" ? s.c[1] + s.r : Math.max(...s.points.map((p) => p[1])))));
  const size = Math.max(maxX - minX, bottom - minY) + pad * 2;
  const cx = (minX + maxX) / 2;
  return {
    shapes,
    viewBox: [cx - size / 2, bottom + pad * 0.6 - size, size, size],
    groundY,
    matX: [minX - 6, maxX + 6],
  };
}
