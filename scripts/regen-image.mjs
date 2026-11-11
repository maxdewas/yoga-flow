// Régénère une illustration avec Gemini, à partir du prompt corrigé et d'images de référence de style.
//   node scripts/regen-image.mjs <id> ["consigne supplémentaire"] [--model gemini-3-pro-image]
// Le résultat va dans exports/a-refaire/nouvelles/<id>-<n>.png (rien n'est remplacé dans public/poses).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const args = process.argv.slice(2);
const mi = args.indexOf("--model");
const model = mi >= 0 ? args.splice(mi, 2)[1] : "gemini-3-pro-image";
const [id, extra = ""] = args;
if (!id) throw new Error("usage: node scripts/regen-image.mjs <id> [consigne]");

const env = readFileSync(".env.local", "utf8").match(/^GEMINI_API_KEY=(.+)$/m);
if (!env) throw new Error("GEMINI_API_KEY absente de .env.local");
const key = env[1].trim();

const md = readFileSync("exports/a-refaire/prompts.md", "utf8");
const block = md.split("\n### ").find((b) => b.includes(`\`${id}.png\``));
if (!block) throw new Error(`Pas de prompt pour ${id}`);
const base = block.match(/```\n([\s\S]*?)\n```/)[1];
// La description de style est remplacée par les images de référence, plus fiables.
const pose = base.slice(base.indexOf("Pose:"));

const REFS = ["guerrier-2", "triangle", "pigeon-roi"].filter((r) => existsSync(`public/poses/${r}.png`));
const refParts = REFS.map((r) => ({ inline_data: { mime_type: "image/png", data: readFileSync(`public/poses/${r}.png`).toString("base64") } }));

const text = `The attached images are reference illustrations from an existing set. Create ONE new illustration in exactly the same style: same young woman (light skin, light-brown hair in a high bun), same soft semi-realistic digital painting look, matching sports crop top and leggings in lilac or sage green, barefoot, same beige yoga mat seen from the side, same plain soft cream background, same lighting and framing. Full body visible with margin around it, no text, no logo, single person only, exactly two arms and two legs, every hand and foot anatomically correct and attached to the right limb.
${pose}${extra ? `\nAdditional correction: ${extra}` : ""}`;

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-goog-api-key": key },
  body: JSON.stringify({
    contents: [{ role: "user", parts: [...refParts, { text }] }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "1:1" } },
  }),
});
const json = await res.json();
if (!res.ok) throw new Error(JSON.stringify(json.error ?? json).slice(0, 600));
const img = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
if (!img) throw new Error(`Pas d'image : ${JSON.stringify(json).slice(0, 600)}`);
const data = Buffer.from((img.inlineData ?? img.inline_data).data, "base64");

const dir = "exports/a-refaire/nouvelles";
mkdirSync(dir, { recursive: true });
const n = readdirSync(dir).filter((f) => f.startsWith(`${id}-`)).length + 1;
const out = `${dir}/${id}-${n}.png`;
await sharp(data).resize(500, 500, { fit: "contain", background: "#fbf6f1" }).png().toFile(out);
writeFileSync(`${dir}/${id}-${n}.txt`, `${model}\n\n${text}\n`);
console.log(out);
