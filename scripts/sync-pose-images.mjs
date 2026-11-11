// Recense les illustrations déposées dans public/poses/<id>.(png|jpg|jpeg|webp|svg)
// et écrit src/lib/catalog/pose-images.ts. Lancé automatiquement avant `dev` et `build`.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";

const DIR = "public/poses";
const OUT = "src/lib/catalog/pose-images.ts";
const EXT = /\.(png|jpe?g|webp|svg)$/i;

if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
const files = readdirSync(DIR).filter((f) => EXT.test(f)).sort();
const byId = new Map();
for (const f of files) {
  const id = f.replace(EXT, "");
  // If several formats exist for one pose, keep the first in this order.
  const rank = (name) => ["png", "webp", "jpg", "jpeg", "svg"].indexOf(name.split(".").pop().toLowerCase());
  if (!byId.has(id) || rank(f) < rank(byId.get(id))) byId.set(id, f);
}

const entries = [...byId].map(([id, f]) => `  ${JSON.stringify(id)}: ${JSON.stringify(`/poses/${encodeURIComponent(f)}`)},`);
writeFileSync(
  OUT,
  `// Généré par scripts/sync-pose-images.mjs — ne pas modifier à la main.
// Illustrations présentes dans public/poses, par id de posture.
export const POSE_IMAGES: Record<string, string> = {
${entries.join("\n")}
};
`,
);
console.log(`${byId.size} illustration(s) recensée(s) dans ${DIR}`);
