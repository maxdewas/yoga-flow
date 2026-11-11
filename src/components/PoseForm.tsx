"use client";

import { useState } from "react";
import { useLabels, useMessages } from "@/lib/i18n";
import type { Category, Level, Pose } from "@/lib/types";

const M = {
  fr: {
    name: "Nom *",
    sanskrit: "Nom sanskrit",
    english: "Nom anglais",
    level: "Niveau",
    sided: "Se pratique des deux côtés",
    categories: "Catégories",
    description: "Description / placement",
    benefits: "Bienfaits (un par ligne)",
    contra: "Contre-indications (une par ligne)",
  },
  en: {
    name: "Name *",
    sanskrit: "Sanskrit name",
    english: "English name",
    level: "Level",
    sided: "Practiced on both sides",
    categories: "Categories",
    description: "Description / alignment",
    benefits: "Benefits (one per line)",
    contra: "Contraindications (one per line)",
  },
  es: {
    name: "Nombre *",
    sanskrit: "Nombre en sánscrito",
    english: "Nombre en inglés",
    level: "Nivel",
    sided: "Se practica en ambos lados",
    categories: "Categorías",
    description: "Descripción / alineación",
    benefits: "Beneficios (uno por línea)",
    contra: "Contraindicaciones (una por línea)",
  },
};

export type PoseDraft = Omit<Pose, "id" | "custom" | "name">;

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
  const t = useMessages(M);
  const L = useLabels();
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
          {t.name}
          <input className="input mt-1" required value={nameFr} onChange={(e) => setNameFr(e.target.value)} />
        </label>
        <label className="text-sm">
          {t.sanskrit}
          <input className="input mt-1" value={sanskrit} onChange={(e) => setSanskrit(e.target.value)} />
        </label>
        <label className="text-sm">
          {t.english}
          <input className="input mt-1" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label>
          {t.level}{" "}
          <select className="input mt-1 w-auto" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
            {(Object.keys(L.level) as Level[]).map((l) => (
              <option key={l} value={l}>
                {L.level[l]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={sided} onChange={(e) => setSided(e.target.checked)} />
          {t.sided}
        </label>
      </div>
      <div>
        <p className="mb-1 text-sm">{t.categories}</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(L.category) as Category[]).map((c) => (
            <button type="button" key={c} className="chip" data-active={categories.includes(c)} onClick={() => toggle(c)}>
              {L.category[c]}
            </button>
          ))}
        </div>
      </div>
      <label className="block text-sm">
        {t.description}
        <textarea className="input mt-1" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          {t.benefits}
          <textarea className="input mt-1" rows={4} value={benefits} onChange={(e) => setBenefits(e.target.value)} />
        </label>
        <label className="text-sm">
          {t.contra}
          <textarea className="input mt-1" rows={4} value={contra} onChange={(e) => setContra(e.target.value)} />
        </label>
      </div>
      <button className="btn-primary" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
