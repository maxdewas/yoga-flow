"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PoseSheet, sheetCompleteness } from "@/components/PoseSheet";
import { diffEdit, PoseSheetForm } from "@/components/PoseSheetForm";
import { PoseThumb } from "@/components/PoseThumb";
import { deletePoseImage, savePoseImage, usePoseImage } from "@/lib/images";
import { useAllPoses, useCatalog, useHydrated, usePoseMap, useStore } from "@/lib/store";
import { format, useLabels, useMessages } from "@/lib/i18n";

const M = {
  fr: {
    notFound: "Posture introuvable.", back: "Retour", poses: "← Postures", changePhoto: "Changer la photo", myPhoto: "Ma photo",
    remove: "Retirer", badImage: "Impossible de lire cette image.", bothSides: "Des deux côtés", custom: "Perso",
    edited: "Fiche modifiée", filled: "Fiche remplie à {n} %", complete: "Compléter la fiche", edit: "Modifier la fiche",
    resetConfirm: "Revenir à la fiche d'origine du catalogue ?", reset: "Revenir à la fiche d'origine",
    inUse: "Cette posture est utilisée dans un cours : retire-la d'abord.", deleteConfirm: "Supprimer « {name} » ?",
    delete: "Supprimer", notes: "Mes notes", notesPlaceholder: "Variantes, accessoires, consignes que tu aimes donner…",
    usedIn: "Utilisée dans mes cours", untitled: "Cours sans titre", variantOf: "Variante de", imported: "Catalogue Éléonore",
  },
  en: {
    notFound: "Pose not found.", back: "Back", poses: "← Poses", changePhoto: "Change photo", myPhoto: "My photo",
    remove: "Remove", badImage: "This image can't be read.", bothSides: "Both sides", custom: "Custom",
    edited: "Sheet edited", filled: "Sheet {n}% complete", complete: "Complete the sheet", edit: "Edit the sheet",
    resetConfirm: "Go back to the original catalogue sheet?", reset: "Back to the original sheet",
    inUse: "This pose is used in a class: remove it there first.", deleteConfirm: "Delete “{name}”?",
    delete: "Delete", notes: "My notes", notesPlaceholder: "Variations, props, cues you like to give…",
    usedIn: "Used in my classes", untitled: "Untitled class", variantOf: "Variation of", imported: "Éléonore's catalogue",
  },
  es: {
    notFound: "Postura no encontrada.", back: "Volver", poses: "← Posturas", changePhoto: "Cambiar la foto", myPhoto: "Mi foto",
    remove: "Quitar", badImage: "No se puede leer esta imagen.", bothSides: "Ambos lados", custom: "Personal",
    edited: "Ficha modificada", filled: "Ficha completa al {n} %", complete: "Completar la ficha", edit: "Editar la ficha",
    resetConfirm: "¿Volver a la ficha original del catálogo?", reset: "Volver a la ficha original",
    inUse: "Esta postura se usa en una clase: quítala primero.", deleteConfirm: "¿Eliminar «{name}»?",
    delete: "Eliminar", notes: "Mis notas", notesPlaceholder: "Variantes, accesorios, indicaciones que te gusta dar…",
    usedIn: "Usada en mis clases", untitled: "Clase sin título", variantOf: "Variante de", imported: "Catálogo de Éléonore",
  },
};

export default function PoseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const t = useMessages(M);
  const L = useLabels();
  const router = useRouter();
  const poses = useAllPoses();
  const catalog = useCatalog();
  const poseMap = usePoseMap();
  const pose = poseMap.get(id);
  const note = useStore((s) => s.poseNotes[id] ?? "");
  const edited = useStore((s) => Boolean(s.poseEdits[id]));
  const { setPoseNote, setPoseEdit, resetPoseEdit, deleteCustomPose, customPoses, plans } = useStore();
  const photo = usePoseImage(id);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) return null;
  if (!pose)
    return (
      <p>
        {t.notFound} <Link href="/postures" className="text-accent underline">{t.back}</Link>
      </p>
    );

  // The pose as shipped (catalog) or as created (custom), before the teacher's edits.
  const base = catalog.find((p) => p.id === id) ?? customPoses.find((p) => p.id === id) ?? pose;
  const usedIn = plans.filter((p) => p.sections.some((s) => s.items.some((it) => it.poseId === id)));
  const completeness = sheetCompleteness(pose.details);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/postures" className="text-sm text-muted hover:text-foreground">
        {t.poses}
      </Link>

      <header className="flex flex-col gap-5 sm:flex-row">
        <div className="w-full max-w-[220px] space-y-2">
          <PoseThumb pose={pose} />
          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={() => fileRef.current?.click()}>
              {photo ? t.changePhoto : t.myPhoto}
            </button>
            {photo && (
              <button className="btn text-danger" onClick={() => deletePoseImage(id)}>
                {t.remove}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                setError(null);
                await savePoseImage(id, f);
              } catch {
                setError(t.badImage);
              }
            }}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-bold">{pose.name}</h1>
            <p className="text-muted italic">
              {pose.sanskrit}
              {pose.nameEn && ` · ${pose.nameEn}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="chip" data-active>
              {L.level[pose.level]}
            </span>
            {pose.categories.map((c) => (
              <span key={c} className="chip">
                {L.category[c]}
              </span>
            ))}
            {pose.sided && <span className="chip">{t.bothSides}</span>}
            {pose.custom && <span className="chip">{t.custom}</span>}
            {edited && <span className="chip">{t.edited}</span>}
            {pose.imported && <span className="chip">{t.imported}</span>}
            {pose.variantOf && poseMap.get(pose.variantOf) && (
              <Link href={`/postures/${pose.variantOf}`} className="chip hover:border-accent">
                {t.variantOf} {poseMap.get(pose.variantOf)!.name}
              </Link>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{format(t.filled, { n: completeness })}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-accent" style={{ width: `${completeness}%` }} />
            </div>
          </div>
          {!editing && (
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => setEditing(true)}>
                {completeness < 100 ? t.complete : t.edit}
              </button>
              {edited && !pose.custom && (
                <button
                  className="btn"
                  onClick={() => confirm(t.resetConfirm) && resetPoseEdit(id)}
                >
                  {t.reset}
                </button>
              )}
              {pose.custom && (
                <button
                  className="btn text-danger"
                  onClick={() => {
                    if (usedIn.length) return alert(t.inUse);
                    if (!confirm(format(t.deleteConfirm, { name: pose.name }))) return;
                    deleteCustomPose(id);
                    resetPoseEdit(id);
                    deletePoseImage(id);
                    router.push("/postures");
                  }}
                >
                  {t.delete}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {editing ? (
        <PoseSheetForm
          pose={pose}
          poses={poses}
          onCancel={() => setEditing(false)}
          onSave={(next) => {
            const edit = diffEdit(base, next);
            if (Object.keys(edit).length) setPoseEdit(id, edit);
            else resetPoseEdit(id);
            setEditing(false);
            window.scrollTo({ top: 0 });
          }}
        />
      ) : (
        <PoseSheet pose={pose} poseMap={poseMap} />
      )}

      {!editing && (
        <section className="space-y-2 border-t border-line pt-4">
          <h2 className="text-lg font-bold">{t.notes}</h2>
          <textarea
            className="input"
            rows={4}
            placeholder={t.notesPlaceholder}
            value={note}
            onChange={(e) => setPoseNote(id, e.target.value)}
          />
          {usedIn.length > 0 && (
            <div className="text-sm">
              <h3 className="font-semibold">{t.usedIn}</h3>
              <ul className="mt-1 flex flex-wrap gap-2">
                {usedIn.map((p) => (
                  <li key={p.id}>
                    <Link href={`/cours/${p.id}`} className="chip hover:border-accent">
                      {p.title || t.untitled}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
