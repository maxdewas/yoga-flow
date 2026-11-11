/**
 * Exporte le catalogue pour générer des illustrations ailleurs (ex. ChatGPT).
 *   npm run export:poses   →  exports/postures.csv + exports/postures.json
 * Les images générées sont attendues dans public/poses/<id>.png
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { FAMILIES } from "../src/lib/catalog/families";
import { CATEGORY_LABELS, LEVEL_LABELS } from "../src/lib/types";

const STYLE =
  "Flat vector illustration, original character: a young woman with light skin, dark brown hair in a ponytail, " +
  "sage-green leggings and a terracotta crop top, barefoot, on a thin beige mat line. Plain white background, " +
  "no text, no logo, centered, full body visible, anatomically correct yoga pose, square 1024x1024.";

const rows = Object.entries(FAMILIES).flatMap(([family, poses]) =>
  poses.map((p) => ({
    id: p.id,
    fichier: `public/poses/${p.id}.png`,
    famille: family,
    nom_fr: p.nameFr,
    sanskrit: p.sanskrit,
    nom_en: p.nameEn,
    niveau: LEVEL_LABELS[p.level],
    categories: p.categories.map((c) => CATEGORY_LABELS[c]).join(" / "),
    cote: p.sided ? "oui" : "non",
    description: p.description,
    prompt: `${STYLE} Pose: ${p.nameEn}${p.sanskrit ? ` (${p.sanskrit})` : ""}. ${p.description}${p.sided ? " Show the right side." : ""}`,
  })),
);

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
const header = Object.keys(rows[0]);
const csv = [header.join(","), ...rows.map((r) => header.map((h) => csvCell(String(r[h as keyof typeof r]))).join(","))].join("\n");

mkdirSync("exports", { recursive: true });
writeFileSync("exports/postures.csv", "﻿" + csv); // BOM so Excel/Numbers read the accents
writeFileSync("exports/postures.json", JSON.stringify({ style: STYLE, postures: rows }, null, 2));
console.log(`${rows.length} postures → exports/postures.csv, exports/postures.json`);
