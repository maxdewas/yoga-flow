/**
 * Planche de vérification des figurines d'une famille (outil de dev).
 *   npm run figures -- <famille|all> <sortie.html>
 * Familles : debout, genoux, assises, allongees, inversions, yin
 * Puis ouvrir / capturer le HTML pour vérifier chaque dessin.
 */
import { writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { PoseFigure } from "../src/components/PoseFigure";
import { BUILTIN_POSES } from "../src/lib/poses";
import { FAMILIES } from "../src/lib/catalog/families";

const [family = "all", out = "figures.html"] = process.argv.slice(2);
const ids = family === "all" ? null : new Set(FAMILIES[family as keyof typeof FAMILIES]?.map((p) => p.id));
if (ids && !ids.size) throw new Error(`Famille inconnue : ${family}`);
const poses = BUILTIN_POSES.filter((p) => !ids || ids.has(p.id));

const cells = poses
  .map((p) => {
    const fig = p.figure
      ? renderToStaticMarkup(<PoseFigure def={p.figure} className="fig" />)
      : `<div class="missing">pas de figurine</div>`;
    return `<figure>${fig}<figcaption><b>${p.nameFr}</b><br><i>${p.id}</i></figcaption></figure>`;
  })
  .join("");

writeFileSync(
  out,
  `<!doctype html><meta charset="utf-8"><style>
  :root{--fig-skin:#f2c4a2;--fig-skin-far:#ddaa86;--fig-pants:#5f7c62;--fig-pants-far:#46604a;--fig-top:#d9875f;--fig-hair:#5b3a2a;--fig-mat:#ddd3c3}
  body{margin:0;padding:6px;display:grid;grid-template-columns:repeat(8,1fr);gap:4px;font:11px sans-serif;background:#faf7f2}
  figure{margin:0;text-align:center;background:#fff;border:1px solid #eee;padding:4px}
  .fig{width:100%;aspect-ratio:1}.missing{aspect-ratio:1;display:grid;place-items:center;color:#b2483a}
  </style>${cells}`,
);
console.log(`${poses.length} postures (${poses.filter((p) => !p.figure).length} sans figurine) → ${out}`);
