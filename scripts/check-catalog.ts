/**
 * Contrôle du catalogue (outil de dev) :  npm run check:catalog
 * ids uniques, catégories valides, noms en double, références des modèles, illustrations bien nommées.
 * Affiche la couverture visuelle (illustration, figurine, ou rien).
 */
import { FAMILIES } from "../src/lib/catalog/families";
import { DETAILS } from "../src/lib/catalog/details";
import { FIGURES } from "../src/lib/catalog/figures";
import { POSE_IMAGES } from "../src/lib/catalog/pose-images";
import { BUILTIN_SEQUENCES } from "../src/lib/sequences";
import { TEMPLATES } from "../src/lib/templates";
import { LABELS } from "../src/lib/labels";

const { category: CATEGORY_LABELS, level: LEVEL_LABELS, position: POSITION_LABELS, type: TYPE_LABELS, chakra: CHAKRA_LABELS } = LABELS.fr;
import { buildCatalog } from "../src/lib/poses";
import type { LocaleContent } from "../src/lib/catalog/localize";
import { LOCALES } from "../src/lib/locale";
import FR from "../src/lib/catalog/locales/fr.json";
import EN from "../src/lib/catalog/locales/en.json";
import ES from "../src/lib/catalog/locales/es.json";

const problems: string[] = [];
const all = Object.entries(FAMILIES).flatMap(([family, poses]) => poses.map((p) => ({ ...p, family })));
const seen = new Map<string, string>();
for (const p of all) {
  if (seen.has(p.id)) problems.push(`id en double : ${p.id} (${seen.get(p.id)} et ${p.family})`);
  seen.set(p.id, p.family);
  if (!/^[a-z0-9-]+$/.test(p.id)) problems.push(`id invalide : ${p.id}`);
  if (!p.categories.length) problems.push(`sans catégorie : ${p.id}`);
  for (const c of p.categories) if (!(c in CATEGORY_LABELS)) problems.push(`catégorie inconnue « ${c} » : ${p.id}`);
  if (!(p.level in LEVEL_LABELS)) problems.push(`niveau inconnu : ${p.id}`);
  if (!p.description || p.benefits.length === 0) problems.push(`texte incomplet : ${p.id}`);
}
const names = new Map<string, string>();
for (const p of all) {
  const key = p.nameFr.toLowerCase();
  if (names.has(key)) problems.push(`nom français en double « ${p.nameFr} » : ${names.get(key)} et ${p.id}`);
  names.set(key, p.id);
}
for (const id of Object.keys(FIGURES)) if (!seen.has(id)) problems.push(`figurine orpheline : ${id}`);
for (const id of Object.keys(POSE_IMAGES))
  if (!seen.has(id)) problems.push(`illustration sans posture (nom de fichier ?) : public/poses/${POSE_IMAGES[id].split("/").pop()}`);
// Fiches détaillées : la posture existe, les liens pointent vers des postures existantes, valeurs connues.
for (const [id, d] of Object.entries(DETAILS)) {
  if (!seen.has(id)) problems.push(`fiche sans posture : ${id}`);
  for (const k of ["preparatory", "counterPoses", "variations", "progressions"] as const)
    for (const ref of d[k] ?? []) {
      if (!seen.has(ref)) problems.push(`fiche ${id} → ${k} : posture inconnue ${ref}`);
      if (ref === id) problems.push(`fiche ${id} → ${k} : se cite elle-même`);
    }
  if (d.position && !(d.position in POSITION_LABELS)) problems.push(`fiche ${id} : position inconnue ${d.position}`);
  for (const t of d.types ?? []) if (!(t in TYPE_LABELS)) problems.push(`fiche ${id} : type inconnu ${t}`);
  for (const c of d.chakras ?? []) if (!(c in CHAKRA_LABELS)) problems.push(`fiche ${id} : chakra inconnu ${c}`);
}
for (const t of TEMPLATES)
  for (const s of t.sections) for (const [id] of s.steps) if (!seen.has(id)) problems.push(`modèle « ${t.id} » : posture inconnue ${id}`);
for (const q of BUILTIN_SEQUENCES)
  for (const [id] of q.steps) if (!seen.has(id)) problems.push(`enchaînement « ${q.id} » : posture inconnue ${id}`);

// Catalogue complet (fait main + importé), dans chaque langue.
const CONTENT = { fr: FR, en: EN, es: ES } as unknown as Record<(typeof LOCALES)[number], LocaleContent>;
for (const locale of LOCALES) {
  const catalog = buildCatalog(locale, CONTENT[locale]);
  const ids = new Set<string>();
  let untranslated = 0;
  for (const p of catalog) {
    if (ids.has(p.id)) problems.push(`[${locale}] id en double : ${p.id}`);
    ids.add(p.id);
    if (!p.name) problems.push(`[${locale}] sans nom : ${p.id}`);
    if (p.imported && locale !== "en" && p.name === p.nameEn) untranslated++;
    if (!p.categories.length || !p.benefits.length) problems.push(`[${locale}] texte incomplet : ${p.id}`);
  }
  for (const p of catalog) {
    if (p.variantOf && !ids.has(p.variantOf)) problems.push(`[${locale}] variante de posture inconnue : ${p.id} → ${p.variantOf}`);
    for (const l of [...(p.details?.oftenBefore ?? []), ...(p.details?.oftenAfter ?? [])])
      if (!ids.has(l.id)) problems.push(`[${locale}] enchaînement vers posture inconnue : ${p.id} → ${l.id}`);
  }
  const variants = catalog.filter((p) => p.variantOf).length;
  console.log({ locale, total: catalog.length, importees: catalog.filter((p) => p.imported).length, variants, nomsNonTraduits: untranslated });
}

const counts = Object.fromEntries(Object.entries(FAMILIES).map(([f, ps]) => [f, ps.length]));
const withImage = all.filter((p) => POSE_IMAGES[p.id]).length;
const withFigureOnly = all.filter((p) => !POSE_IMAGES[p.id] && FIGURES[p.id]).length;
console.log({ total: all.length, ...counts });
console.log({ illustrations: withImage, figurinesSeules: withFigureOnly, sansVisuel: all.length - withImage - withFigureOnly });
console.log({ fichesDetaillees: Object.keys(DETAILS).length, aRemplir: all.length - Object.keys(DETAILS).length });
if (problems.length) {
  console.log(problems.join("\n"));
  process.exitCode = 1;
} else console.log("Catalogue OK");
