"use client";

import { Clock, CopyPlus, Download, Ellipsis, Layers, LayoutTemplate, Play, Plus, Printer, Sparkles, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PoseThumb } from "@/components/PoseThumb";
import { MenuItem, Popover } from "@/components/ui/Popover";
import { formatDuration, planSeconds } from "@/lib/duration";
import { parseBackup, useHydrated, usePoseMap, useStore, type Backup } from "@/lib/store";
import { LEVEL_LABELS, STYLE_LABELS, type ClassPlan, type Pose } from "@/lib/types";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bonjour" : h < 18 ? "Bel après-midi" : "Bonsoir";
}

export default function HomePage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { plans, customPoses, poseNotes, poseEdits, sequences, createPlan, duplicatePlan, deletePlan, restore } = useStore();
  const poseMap = usePoseMap();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!hydrated) return null;

  const exportBackup = () => {
    const backup: Backup = {
      app: "flow-creator",
      version: 1,
      exportedAt: new Date().toISOString(),
      plans,
      customPoses,
      poseNotes,
      poseEdits,
      sequences,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `flow-creator-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importBackup = async (file: File) => {
    let parsed: Backup | string;
    try {
      parsed = parseBackup(JSON.parse(await file.text()));
    } catch {
      parsed = "Le fichier n'est pas un JSON valide.";
    }
    if (typeof parsed === "string") return setMessage(parsed);
    if (!confirm(`Remplacer les données actuelles par cette sauvegarde (${parsed.plans.length} cours) ?`)) return;
    restore(parsed);
    setMessage("Sauvegarde restaurée.");
  };

  const sorted = [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const totalMinutes = Math.round(plans.reduce((n, p) => n + planSeconds(p), 0) / 60);
  const newPlan = () => router.push(`/cours/${createPlan()}`);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-line bg-[linear-gradient(135deg,var(--accent-soft)_0%,var(--surface)_45%,var(--lilac-soft)_100%)] p-6 shadow-soft sm:p-10">
        <div className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-clay/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">{greeting()}</p>
            <h1 className="mt-2 font-display text-4xl leading-[1.05] font-semibold sm:text-5xl">
              Prépare ton prochain cours, <span className="text-accent italic">en douceur.</span>
            </h1>
            <p className="mt-3 text-muted">Compose ton flow, vérifie son équilibre, puis lance-le en mode guidé ou imprime ta fiche.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="btn-primary py-3 pr-5 pl-4 text-base" onClick={newPlan}>
                <Plus size={18} /> Nouveau cours
              </button>
              <Link href="/postures" className="btn py-3 text-base">
                <Layers size={17} /> Bibliothèque
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              [String(plans.length), "cours"],
              [String(poseMap.size), "postures"],
              [`${totalMinutes}`, "min prêtes"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-surface/80 px-4 py-3 text-center shadow-soft backdrop-blur sm:px-6">
                <dd className="font-display text-3xl font-semibold">{v}</dd>
                <dt className="text-[11px] font-bold tracking-wider text-muted uppercase">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mt-10 mb-4 flex items-end justify-between gap-3">
        <h2 className="font-display text-3xl font-semibold">Mes cours</h2>
        {sorted.length > 0 && (
          <button className="btn" onClick={newPlan}>
            <Plus size={16} /> Nouveau
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: <Sparkles size={22} />, title: "Générer un cours", text: "Style, niveau et durée : tout est construit pour toi." },
            { icon: <LayoutTemplate size={22} />, title: "Partir d'un modèle", text: "Réveil doux, vinyasa, yin du soir…" },
            { icon: <Layers size={22} />, title: "Composer librement", text: "Plus de 400 postures illustrées." },
          ].map((o) => (
            <button
              key={o.title}
              onClick={newPlan}
              className="group flex flex-col items-start gap-3 rounded-3xl border border-dashed border-line bg-surface/60 p-6 text-left transition hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface hover:shadow-soft"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">{o.icon}</span>
              <span className="font-display text-xl font-semibold">{o.title}</span>
              <span className="text-sm text-muted">{o.text}</span>
            </button>
          ))}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              poseMap={poseMap}
              onDuplicate={() => duplicatePlan(plan.id)}
              onDelete={() => confirm(`Supprimer « ${plan.title || "ce cours"} » ?`) && deletePlan(plan.id)}
            />
          ))}
        </ul>
      )}

      <section className="mt-12 flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 sm:flex-row sm:items-center">
        <div className="flex-1 text-sm">
          <h2 className="font-semibold">Sauvegarde</h2>
          <p className="mt-0.5 text-muted">
            Tout est enregistré dans ce navigateur. Exporte une sauvegarde de temps en temps (cours, enchaînements, postures perso,
            notes et fiches ; les photos ne sont pas incluses).
          </p>
          {message && <p className="mt-1 font-semibold text-accent">{message}</p>}
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={exportBackup}>
            <Download size={15} /> Exporter
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            <Upload size={15} /> Restaurer
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importBackup(f);
              e.target.value = "";
            }}
          />
        </div>
      </section>
    </div>
  );
}

function PlanCard({ plan, poseMap, onDuplicate, onDelete }: { plan: ClassPlan; poseMap: Map<string, Pose>; onDuplicate: () => void; onDelete: () => void }) {
  const items = plan.sections.flatMap((s) => s.items);
  const thumbs = [...new Map(items.map((it) => [it.poseId, poseMap.get(it.poseId)])).values()].filter((p): p is Pose => !!p);
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link href={`/cours/${plan.id}`} className="block">
        <div className="grid h-36 grid-cols-4 grid-rows-2 gap-px bg-line/60">
          {Array.from({ length: 8 }, (_, i) => {
            const p = thumbs[i];
            return (
              <div key={i} className={`overflow-hidden bg-thumb ${i === 0 ? "col-span-2 row-span-2" : ""} ${i > 4 ? "hidden" : ""}`}>
                {p ? <PoseThumb pose={p} className="h-full rounded-none" /> : <div className="h-full bg-surface-2" />}
              </div>
            );
          })}
        </div>
        <div className="p-4 pb-2">
          <p className="text-[11px] font-bold tracking-wider text-accent uppercase">
            {STYLE_LABELS[plan.style]} · {LEVEL_LABELS[plan.level]}
          </p>
          <h3 className={`mt-0.5 font-display text-xl leading-tight font-semibold ${plan.title ? "" : "text-muted italic"}`}>{plan.title || "Sans titre"}</h3>
          {(plan.theme || plan.intention) && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{plan.theme || plan.intention}</p>}
        </div>
      </Link>
      <div className="mt-auto flex items-center gap-2 px-4 pb-4 text-xs font-semibold text-muted">
        <Clock size={13} /> {formatDuration(planSeconds(plan))}
        <span>·</span>
        {items.length} postures
        <span className="hidden sm:inline">· {new Date(plan.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
        <div className="ml-auto flex items-center gap-1">
          <Popover
            align="end"
            className="w-52"
            trigger={({ open, toggle }) => (
              <button className="icon-btn h-9 w-9" data-active={open} onClick={toggle} aria-label={`Options de ${plan.title || "ce cours"}`}>
                <Ellipsis size={17} />
              </button>
            )}
          >
            {(close) => (
              <div role="menu">
                <Link href={`/cours/${plan.id}/imprimer`} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-surface-2">
                  <Printer size={15} className="opacity-80" /> Imprimer / PDF
                </Link>
                <MenuItem icon={<CopyPlus size={15} />} onClick={() => (close(), onDuplicate())}>
                  Dupliquer
                </MenuItem>
                <MenuItem danger icon={<Trash2 size={15} />} onClick={() => (close(), onDelete())}>
                  Supprimer
                </MenuItem>
              </div>
            )}
          </Popover>
          {items.length > 0 && (
            <Link
              href={`/cours/${plan.id}/jouer`}
              aria-label={`Lancer ${plan.title || "le cours"}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-surface shadow-soft transition hover:scale-105"
            >
              <Play size={15} fill="currentColor" className="ml-0.5" />
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}
