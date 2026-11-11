/**
 * Éléonore's catalogue, decoded from the compact file written by scripts/import-catalogue.py.
 * This module owns the decoding; texts are rendered per language in ../localize.ts.
 */
import type { Chakra, Guna, Kosha, PoseType, Position, Vayu } from "../../details";
import type { Audience, BodyPosition, BodyZone, Meridian, PoseTag, Prop, Shape, Therapeutic } from "../../labels";
import type { Category, Level } from "../../types";
import FR_NAMES from "./names-fr.json";
import DATA from "./poses.json";

export type SiteFamily = "debout" | "genoux" | "assises" | "allongees" | "inversions" | "yin";

export interface ImportedFacts {
  id: string;
  /** English name as written in the source file. */
  en: string;
  sanskrit: string;
  family?: SiteFamily;
  variantOf?: string;
  level?: Level;
  sided?: boolean;
  categories: Category[];
  position?: Position;
  types: PoseType[];
  shapes: Shape[];
  bodyPositions: BodyPosition[];
  zones: BodyZone[];
  therapeutic: Therapeutic[];
  audiences: Audience[];
  props: Prop[];
  chakras: Chakra[];
  styles: string[];
  tags: PoseTag[];
  gunas: Guna[];
  vayus: Vayu[];
  koshas: Kosha[];
  meridians: Meridian[];
  popularityRank?: number;
  before: { id: string; pct: number }[];
  after: { id: string; pct: number }[];
}

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
type Row = (string | number | null | (string | number)[][])[];
const data = DATA as unknown as {
  columns: string[];
  dicts: Record<string, string[]>;
  styles: string[];
  poses: Row[];
  enrich: Record<string, Row>;
};
const col = Object.fromEntries(data.columns.map((c, i) => [c, i])) as Record<string, number>;

/** Same rule as simple_slug() in the import script. */
const simpleSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const ids = data.poses.map((r) => (r[col.id] as string | null) ?? simpleSlug(r[col.en] as string));
const ref = (v: string | number) => (typeof v === "number" ? ids[v] : v);

function list<T extends string>(row: Row, name: string): T[] {
  const s = (row[col[name]] as string | undefined) ?? "";
  return [...s].map((ch) => data.dicts[name][ALPHABET.indexOf(ch)] as T);
}
function scalar<T extends string>(row: Row, name: string): T | undefined {
  const v = row[col[name]];
  return typeof v === "number" ? (data.dicts[name][v] as T) : undefined;
}
const links = (v: unknown) => ((v as [string | number, number][] | undefined) ?? []).map(([r, pct]) => ({ id: ref(r), pct }));

function decode(row: Row, id: string): ImportedFacts {
  const sd = row[col.sd];
  const vo = row[col.vo] as string | number | null | undefined;
  return {
    id,
    en: (row[col.en] as string) ?? "",
    sanskrit: (row[col.sa] as string) ?? "",
    family: scalar<SiteFamily>(row, "fam"),
    variantOf: vo == null ? undefined : ref(vo),
    level: scalar<Level>(row, "lvl"),
    sided: typeof sd === "number" ? sd === 1 : undefined,
    categories: list<Category>(row, "cat"),
    position: scalar<Position>(row, "pos"),
    types: list<PoseType>(row, "types"),
    shapes: list<Shape>(row, "shape"),
    bodyPositions: list<BodyPosition>(row, "positions"),
    zones: list<BodyZone>(row, "zones"),
    therapeutic: list<Therapeutic>(row, "thera"),
    audiences: list<Audience>(row, "pub"),
    props: list<Prop>(row, "props"),
    chakras: list<Chakra>(row, "chak"),
    styles: [...((row[col.sty] as string | undefined) ?? "")].map((ch) => data.styles[ALPHABET.indexOf(ch)]),
    tags: list<PoseTag>(row, "tags"),
    gunas: list<Guna>(row, "gun"),
    vayus: list<Vayu>(row, "vay"),
    koshas: list<Kosha>(row, "kos"),
    meridians: list<Meridian>(row, "mer"),
    popularityRank: (row[col.rank] as number | undefined) ?? undefined,
    before: links(row[col.bef]),
    after: links(row[col.aft]),
  };
}

/** New poses, in source order. */
export const IMPORTED: ImportedFacts[] = data.poses.map((r, i) => decode(r, ids[i]));

/** Facts about poses of the hand-written catalogue (by its id); they only fill gaps there. */
export const ENRICH: Record<string, ImportedFacts> = Object.fromEntries(
  Object.entries(data.enrich).map(([id, r]) => [id, decode(r, id)]),
);

/** French names of the imported poses (contextual translations). */
export const IMPORTED_NAMES_FR = FR_NAMES as Record<string, string>;

/** English display name from the source name: "Warrior Pose Ii" → "Warrior Pose II". */
export const englishName = (en: string) => en.replace(/\b(I{1,3}|Iv|Vi{0,3})\b/gi, (m) => m.toUpperCase());
