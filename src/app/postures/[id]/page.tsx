"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PoseSheet, sheetCompleteness } from "@/components/PoseSheet";
import { diffEdit, PoseSheetForm } from "@/components/PoseSheetForm";
import { PoseThumb } from "@/components/PoseThumb";
import { deletePoseImage, savePoseImage, usePoseImage } from "@/lib/images";
import { BUILTIN_POSES } from "@/lib/poses";
import { useAllPoses, useHydrated, usePoseMap, useStore } from "@/lib/store";
import { CATEGORY_LABELS, LEVEL_LABELS } from "@/lib/types";

export default function PoseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const router = useRouter();
  const poses = useAllPoses();
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
        Posture introuvable. <Link href="/postures" className="text-accent underline">Retour</Link>
      </p>
    );

  // The pose as shipped (catalog) or as created (custom), before the teacher's edits.
  const base = BUILTIN_POSES.find((p) => p.id === id) ?? customPoses.find((p) => p.id === id) ?? pose;
  const usedIn = plans.filter((p) => p.sections.some((s) => s.items.some((it) => it.poseId === id)));
  const completeness = sheetCompleteness(pose.details);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/postures" className="text-sm text-muted hover:text-foreground">
        ← Postures
      </Link>

      <header className="flex flex-col gap-5 sm:flex-row">
        <div className="w-full max-w-[220px] space-y-2">
          <PoseThumb pose={pose} />
          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={() => fileRef.current?.click()}>
              {photo ? "Changer la photo" : "Ma photo"}
            </button>
            {photo && (
              <button className="btn text-danger" onClick={() => deletePoseImage(id)}>
                Retirer
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
                setError("Impossible de lire cette image.");
              }
            }}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-bold">{pose.nameFr}</h1>
            <p className="text-muted italic">
              {pose.sanskrit}
              {pose.nameEn && ` · ${pose.nameEn}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="chip" data-active>
              {LEVEL_LABELS[pose.level]}
            </span>
            {pose.categories.map((c) => (
              <span key={c} className="chip">
                {CATEGORY_LABELS[c]}
              </span>
            ))}
            {pose.sided && <span className="chip">Des deux côtés</span>}
            {pose.custom && <span className="chip">Perso</span>}
            {edited && <span className="chip">Fiche modifiée</span>}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Fiche remplie à {completeness} %</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-accent" style={{ width: `${completeness}%` }} />
            </div>
          </div>
          {!editing && (
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => setEditing(true)}>
                {completeness < 100 ? "Compléter la fiche" : "Modifier la fiche"}
              </button>
              {edited && !pose.custom && (
                <button
                  className="btn"
                  onClick={() => confirm("Revenir à la fiche d'origine du catalogue ?") && resetPoseEdit(id)}
                >
                  Revenir à la fiche d&apos;origine
                </button>
              )}
              {pose.custom && (
                <button
                  className="btn text-danger"
                  onClick={() => {
                    if (usedIn.length) return alert("Cette posture est utilisée dans un cours : retire-la d'abord.");
                    if (!confirm(`Supprimer « ${pose.nameFr} » ?`)) return;
                    deleteCustomPose(id);
                    resetPoseEdit(id);
                    deletePoseImage(id);
                    router.push("/postures");
                  }}
                >
                  Supprimer
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
          <h2 className="text-lg font-bold">Mes notes</h2>
          <textarea
            className="input"
            rows={4}
            placeholder="Variantes, accessoires, consignes que tu aimes donner…"
            value={note}
            onChange={(e) => setPoseNote(id, e.target.value)}
          />
          {usedIn.length > 0 && (
            <div className="text-sm">
              <h3 className="font-semibold">Utilisée dans mes cours</h3>
              <ul className="mt-1 flex flex-wrap gap-2">
                {usedIn.map((p) => (
                  <li key={p.id}>
                    <Link href={`/cours/${p.id}`} className="chip hover:border-accent">
                      {p.title || "Cours sans titre"}
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
