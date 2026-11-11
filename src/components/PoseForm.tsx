"use client";

import { useState } from "react";
import { CATEGORY_LABELS, LEVEL_LABELS, type Category, type Level, type Pose } from "@/lib/types";

export type PoseDraft = Omit<Pose, "id" | "custom">;

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export function PoseForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: PoseDraft;
  submitLabel: string;
  onSubmit: (draft: PoseDraft) => void;
}) {
  const [nameFr, setNameFr] = useState(initial?.nameFr ?? "");
  const [sanskrit, setSanskrit] = useState(initial?.sanskrit ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [level, setLevel] = useState<Level>(initial?.level ?? "debutant");
  const [sided, setSided] = useState(initial?.sided ?? false);
  const [categories, setCategories] = useState<Category[]>(initial?.categories ?? []);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [benefits, setBenefits] = useState(initial?.benefits.join("\n") ?? "");
  const [contra, setContra] = useState(initial?.contraindications.join("\n") ?? "");

  const toggle = (c: Category) =>
    setCategories((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          nameFr: nameFr.trim(),
          sanskrit: sanskrit.trim(),
          nameEn: nameEn.trim(),
          level,
          sided,
          categories,
          description: description.trim(),
          benefits: lines(benefits),
          contraindications: lines(contra),
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Nom français *
          <input className="input mt-1" required value={nameFr} onChange={(e) => setNameFr(e.target.value)} />
        </label>
        <label className="text-sm">
          Nom sanskrit
          <input className="input mt-1" value={sanskrit} onChange={(e) => setSanskrit(e.target.value)} />
        </label>
        <label className="text-sm">
          Nom anglais
          <input className="input mt-1" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label>
          Niveau{" "}
          <select className="input mt-1 w-auto" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
            {(Object.keys(LEVEL_LABELS) as Level[]).map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={sided} onChange={(e) => setSided(e.target.checked)} />
          Se pratique des deux côtés
        </label>
      </div>
      <div>
        <p className="mb-1 text-sm">Catégories</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <button type="button" key={c} className="chip" data-active={categories.includes(c)} onClick={() => toggle(c)}>
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      <label className="block text-sm">
        Description / placement
        <textarea className="input mt-1" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Bienfaits (un par ligne)
          <textarea className="input mt-1" rows={4} value={benefits} onChange={(e) => setBenefits(e.target.value)} />
        </label>
        <label className="text-sm">
          Contre-indications (une par ligne)
          <textarea className="input mt-1" rows={4} value={contra} onChange={(e) => setContra(e.target.value)} />
        </label>
      </div>
      <button className="btn-primary" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
