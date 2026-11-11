#!/usr/bin/env python3
"""
Importe le catalogue d'Éléonore (xlsx) en données structurées pour Flow Creator.

    python3 scripts/import-catalogue.py "/chemin/Cataloge yoga eleonore.xlsx"

Écrit src/lib/catalog/imported/poses.json : uniquement des faits codés (familles, niveaux,
catégories, zones, etc.). Les textes affichés sont rendus dans la langue active par
src/lib/catalog/imported/index.ts ; les noms traduits vivent dans names.json (id → {fr, es}).

Règles :
- une ligne dont le nom anglais (ou, pour une posture de base, le sanskrit) correspond à une
  posture du catalogue existant n'est pas dupliquée : ses faits enrichissent la posture existante ;
- chaque posture pointe vers sa posture de base (« Famille » du fichier) via `vo` ;
- les ids sont dérivés du nom anglais et stables d'un import à l'autre.
Nécessite openpyxl (pip install openpyxl).
"""
import glob
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "src/lib/catalog/imported")


def slug(s):
    s = (s or "").replace("œ", "oe").replace("Œ", "Oe")
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def split(v):
    if v is None:
        return []
    # « Accessoires (mur, briques, sangles) » contient des virgules : on protège les parenthèses.
    s = re.sub(r"\(([^)]*)\)", lambda m: "(" + m.group(1).replace(", ", "|") + ")", str(v))
    return [x.replace("|", ", ").strip() for x in s.split(", ") if x.strip()]


def name_key(s):
    s = (s or "").lower().replace("-", " ")
    s = re.sub(r"\bpose\b", "", s)
    return re.sub(r"\s+", " ", s).strip()


def sanskrit_key(s):
    return re.sub(r"[^a-z]", "", (s or "").lower().replace("sh", "s").replace("rv", "r"))


# --- existing catalogue (parsed from the p(...) constructors) ---------------------------------
existing = []
for f in sorted(glob.glob(os.path.join(ROOT, "src/lib/catalog/*.ts"))):
    src = open(f, encoding="utf-8").read()
    for m in re.finditer(r'p\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]*)",\s*"([^"]*)"', src):
        existing.append({"id": m[1], "sa": m[3], "en": m[4]})
existing_ids = {p["id"] for p in existing}
by_en = {name_key(p["en"]): p["id"] for p in existing}
by_sa = defaultdict(list)
for p in existing:
    if p["sa"]:
        by_sa[sanskrit_key(p["sa"])].append(p["id"])

# --- codes ------------------------------------------------------------------------------------
LEVEL = {"Débutant": "debutant", "Intermédiaire": "intermediaire", "Avancé": "avance"}
POSITION = {
    "Debout": "debout", "Assise": "assise", "À genoux": "a-genoux", "Dorsale (supine)": "dos",
    "Ventrale (prone)": "ventre", "Sur le ventre": "ventre", "Allongée sur le côté": "cote",
    "Tête & épaules": "inversee", "Sur les avant-bras": "mains", "Équilibre sur les bras": "mains",
    "Sur les orteils": "debout", "Accroupie": "debout",
}
POSE_TYPE = {
    "Étirement": "etirement", "Force": "renforcement", "Équilibre": "equilibre",
    "Restauratrice": "relaxation", "Méditative": "meditation", "Pranayama": "respiration",
}
CAT_FROM_TYPE = {
    "Flexion avant": "flexion-avant", "Flexion arrière": "flexion-arriere", "Torsion": "torsion",
    "Inversion": "inversion", "Équilibre": "equilibre", "Restauratrice": "restauratrice",
}
CAT_FROM_POSITION = {
    "Debout": "debout", "Assise": "assise", "À genoux": "a-genoux", "Dorsale (supine)": "allongee",
    "Ventrale (prone)": "allongee", "Sur le ventre": "allongee", "Allongée sur le côté": "allongee",
    "Équilibre sur les bras": "equilibre-bras", "Sur une jambe": "equilibre", "Tête & épaules": "inversion",
    "Accroupie": "debout", "Sur les orteils": "debout",
}
CHAKRA = {
    "Muladhara – racine": "racine", "Svadhisthana – sacré": "sacre", "Manipura – plexus solaire": "plexus",
    "Anahata – cœur": "coeur", "Vishuddha – gorge": "gorge", "Ajna – 3e œil": "troisieme-oeil",
    "Sahasrara – couronne": "couronne",
}
GUNA = {"Sattva": "sattva", "Rajas": "rajas", "Tamas": "tamas"}
VAYU = {"Prana": "prana", "Apana": "apana", "Samana": "samana", "Udana": "udana", "Vyana": "vyana"}
KOSHA = {k + " Kosha": k.lower() for k in ["Annamaya", "Pranamaya", "Manomaya", "Vijnanamaya", "Anandamaya"]}
STILLNESS_TAGS = {"Mudras", "Pranayama", "Méditative", "Kriya", "Shat Kriya"}

wb = openpyxl.load_workbook(sys.argv[1], read_only=True)
rows = [r for r in wb["Catalogue"].iter_rows(min_row=2, values_only=True) if r[1]]
unknown = Counter()


def codes(values, table, field):
    out = []
    for v in values:
        if v in table:
            if table[v] not in out:
                out.append(table[v])
        elif field != "type":
            unknown[(field, v)] += 1
    return out


def site_family(r, cats, ptype, tags):
    """Same six families as the hand-written catalogue."""
    if ptype in ("Méditative", "Pranayama") or tags & STILLNESS_TAGS:
        return "yin"
    if "inversion" in cats or r[6] == "Tête & épaules":
        return "inversions"
    main = r[6] or next(iter(split(r[7])), None)
    return {
        "Debout": "debout", "Sur les orteils": "debout", "Accroupie": "debout", "Assise": "assises",
        "À genoux": "genoux", "Dorsale (supine)": "allongees", "Ventrale (prone)": "allongees",
        "Sur le ventre": "allongees", "Allongée sur le côté": "allongees", "Sur les avant-bras": "inversions",
        "Équilibre sur les bras": "inversions",
    }.get(main)


RESERVED = re.compile(r"^(yin|med|mudra|resp)-")
taken = set(existing_ids)
row_id = {}
mapped_existing = {}  # row index -> existing id
for i, r in enumerate(rows):
    en, sa, fam = r[1], r[2], r[3]
    hit = by_en.get(name_key(en))
    if not hit and en == fam and sa and len(by_sa.get(sanskrit_key(sa), [])) == 1:
        hit = by_sa[sanskrit_key(sa)][0]
    if hit and hit not in mapped_existing.values():
        mapped_existing[i] = hit
        row_id[i] = hit
        continue
    base = slug(en) or f"posture-{r[0]}"
    if RESERVED.match(base):
        base = "p-" + base
    pid = base if base not in taken else f"{base}-{r[0]}"
    taken.add(pid)
    row_id[i] = pid

id_by_name = {}
for i, r in enumerate(rows):
    id_by_name.setdefault(r[1], row_id[i])

# family base: the row named like the family, else the most popular row of the family
family_rows = defaultdict(list)
for i, r in enumerate(rows):
    family_rows[r[3]].append(i)
family_base = {}
for fam, idx in family_rows.items():
    named = [i for i in idx if rows[i][1] == fam]
    family_base[fam] = row_id[named[0]] if named else row_id[max(idx, key=lambda i: rows[i][11] or 0)]


def transitions(v):
    out = []
    for part in (v or "").split(" ; "):
        m = re.match(r"(.+) \((\d+)%\)$", part.strip())
        if m and m[1] in id_by_name:
            out.append([id_by_name[m[1]], int(m[2])])
    return out


styles = []
style_index = {}


def style_ids(values):
    out = []
    for s in values:
        if s not in style_index:
            style_index[s] = len(styles)
            styles.append(s)
        out.append(style_index[s])
    return out


facts = {}
for i, r in enumerate(rows):
    tags = set(split(r[19]))
    positions = split(r[7])
    cats = []
    for p in ([r[6]] if r[6] else []) + positions:
        c = CAT_FROM_POSITION.get(p)
        if c and c not in cats:
            cats.append(c)
    for t in [r[8]] + split(r[9]):
        c = CAT_FROM_TYPE.get(t)
        if c and c not in cats:
            cats.append(c)
    zones = split(r[13])
    if "Hanches (ouverture)" in zones and r[8] in ("Étirement", "Restauratrice") and "ouverture-hanches" not in cats:
        cats.append("ouverture-hanches")
    if r[8] == "Force" and "Abdominaux (core)" in zones and "gainage" not in cats:
        cats.append("gainage")
    pos = POSITION.get(r[6]) or next((POSITION[p] for p in positions if p in POSITION), None)
    d = {
        "en": r[1].strip(),
        "sa": (r[2] or "").strip(),
        "fam": site_family(r, cats, r[8], tags),
        "lvl": LEVEL.get(r[5]),
        "sd": {"Asymétrique": 1, "Symétrique": 0}.get(r[10]),
        "cat": cats,
        "pos": pos,
        "types": codes([r[8]] + split(r[9]), POSE_TYPE, "type") if r[8] or r[9] else [],
        "shape": [r[8]] if r[8] in ("Flexion latérale",) else [],
        "positions": [slug(p) for p in positions],
        "zones": [slug(z) for z in zones],
        "thera": [slug(t) for t in split(r[14]) if t != "Thérapie (général)"],
        "pub": [slug(p) for p in split(r[15])],
        "props": [slug(p) for p in split(r[16])],
        "chak": codes(split(r[17]), CHAKRA, "chakra"),
        "sty": style_ids(split(r[18])),
        "tags": [slug(t) for t in tags],
        "gun": codes(split(r[20]), GUNA, "guna"),
        "vay": codes(split(r[21]), VAYU, "vayu"),
        "kos": codes(split(r[22]), KOSHA, "kosha"),
        "mer": [slug(m) for m in split(r[23]) if m != "Méridiens (général)"],
        "rank": r[12],
        "bef": transitions(r[24]),
        "aft": transitions(r[25]),
    }
    d["shape"] = ["flexion-laterale"] if r[8] == "Flexion latérale" or "Flexion latérale" in split(r[9]) else []
    base = family_base[r[3]]
    if base != row_id[i]:
        d["vo"] = base
    facts[i] = d

# Fill gaps from the family (level, sidedness, family, categories), then hard defaults.
for fam, idx in family_rows.items():
    lvl = Counter(facts[i]["lvl"] for i in idx if facts[i]["lvl"]).most_common(1)
    sd = Counter(facts[i]["sd"] for i in idx if facts[i]["sd"] is not None).most_common(1)
    sf = Counter(facts[i]["fam"] for i in idx if facts[i]["fam"]).most_common(1)
    cats = Counter(c for i in idx for c in facts[i]["cat"]).most_common(2)
    for i in idx:
        d = facts[i]
        d["lvl"] = d["lvl"] or (lvl[0][0] if lvl else "debutant")
        d["sd"] = d["sd"] if d["sd"] is not None else (sd[0][0] if sd else 0)
        d["fam"] = d["fam"] or (sf[0][0] if sf else "debout")
        if not d["cat"]:
            d["cat"] = [c for c, _ in cats] or ["debout"]

# --- compact encoding ------------------------------------------------------------------------
# One array per pose, columns in COLUMNS order. Code lists are strings of one-char indices into
# dicts[column] (ALPHABET). `id` is null when it equals simpleSlug(en) (see imported/index.ts).
COLUMNS = ["id", "en", "sa", "fam", "vo", "lvl", "sd", "cat", "pos", "types", "shape", "positions",
           "zones", "thera", "pub", "props", "chak", "sty", "tags", "gun", "vay", "kos", "mer", "rank", "bef", "aft"]
LISTS = ["cat", "types", "shape", "positions", "zones", "thera", "pub", "props", "chak", "tags", "gun", "vay", "kos", "mer"]
SCALARS = ["fam", "lvl", "pos"]
ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
dicts = {k: [] for k in LISTS + SCALARS}


def code(field, v):
    table = dicts[field]
    if v not in table:
        table.append(v)
    return table.index(v)


def enc_list(field, values):
    out = "".join(ALPHABET[code(field, v)] for v in values)
    assert len(dicts[field]) <= len(ALPHABET), field
    return out


def simple_slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


new_ids = [row_id[i] for i in facts if i not in mapped_existing]
index_of = {pid: n for n, pid in enumerate(new_ids)}


def ref(pid):
    return index_of.get(pid, pid)  # index into poses, or an existing catalogue id


def encode(d, pid):
    row = []
    for c in COLUMNS:
        v = d.get(c)
        if c == "id":
            row.append(None if pid is None or pid == simple_slug(d["en"]) else pid)
        elif c == "en":
            row.append(v)
        elif c in LISTS:
            row.append(enc_list(c, v or []))
        elif c in SCALARS:
            row.append(None if v is None else code(c, v))
        elif c == "sty":
            row.append("".join(ALPHABET[x] for x in v) if v else "")
        elif c == "vo":
            row.append(None if v is None else ref(v))
        elif c in ("bef", "aft"):
            row.append([[ref(t), pct] for t, pct in v])
        else:
            row.append(v)
    while row and row[-1] in (None, "", []):
        row.pop()
    return row


poses, enrich = [], {}
for i, d in facts.items():
    if i in mapped_existing:
        e = dict(d, en="", fam=None, lvl=None, cat=[], vo=None)
        enrich[mapped_existing[i]] = encode(e, None)
    else:
        poses.append(encode(d, row_id[i]))
assert len(styles) <= len(ALPHABET)

os.makedirs(OUT_DIR, exist_ok=True)
with open(os.path.join(OUT_DIR, "poses.json"), "w", encoding="utf-8") as fh:
    json.dump({"columns": COLUMNS, "dicts": dicts, "styles": styles, "poses": poses, "enrich": enrich},
              fh, ensure_ascii=False, separators=(",", ":"))

# Family → base pose id, for attaching per-family texts (dev artefact, not shipped).
os.makedirs(os.path.join(ROOT, ".cache"), exist_ok=True)
with open(os.path.join(ROOT, ".cache/family-bases.json"), "w", encoding="utf-8") as fh:
    json.dump(family_base, fh, ensure_ascii=False, indent=1)

print(f"{len(rows)} lignes → {len(poses)} nouvelles postures, {len(enrich)} postures existantes enrichies")
print("familles :", dict(Counter(facts[i]["fam"] for i in facts if i not in mapped_existing)))
print("variantes :", sum(1 for i in facts if "vo" in facts[i]), "· bases :", len(set(family_base.values())))
if unknown:
    print("valeurs non codées :", dict(unknown))
