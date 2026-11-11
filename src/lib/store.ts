"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { mergeDetails, type PoseDetails } from "./details";
import { detectLocale, type Locale, type Localized } from "./locale";
import type { LocaleContent } from "./catalog/localize";
import { buildCatalog, loadContent, loadedContent } from "./poses";
import type { ClassPlan, Pose, SavedSequence, Section, SequenceItem } from "./types";

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

const NEW_PLAN_SECTIONS: Localized<[string, string, string]> = {
  fr: ["Centrage & échauffement", "Cœur de séance", "Retour au calme"],
  en: ["Centering & warm-up", "Main practice", "Cool-down"],
  es: ["Centramiento y calentamiento", "Parte principal", "Vuelta a la calma"],
};

/** Suffix of a duplicated plan's title. */
const COPY_SUFFIX: Localized<string> = { fr: "(copie)", en: "(copy)", es: "(copia)" };

/** Empty plan whose default section titles are written in `locale`. */
export function newPlan(locale: Locale = detectLocale()): ClassPlan {
  return {
    id: uid(),
    title: "",
    style: "vinyasa",
    targetMinutes: 60,
    theme: "",
    intention: "",
    level: "debutant",
    notes: "",
    sections: NEW_PLAN_SECTIONS[locale].map((title) => ({ id: uid(), title, items: [] })),
    createdAt: now(),
    updatedAt: now(),
  };
}

export function newItem(pose: Pose): SequenceItem {
  return {
    id: uid(),
    poseId: pose.id,
    hold: 5,
    unit: "respirations",
    side: pose.sided ? "les-deux" : "aucun",
    breath: "aucun",
    cue: "",
  };
}

/** Préférences d'affichage de l'éditeur et du lecteur, propres à cet appareil. */
export interface Prefs {
  /** Interface and catalogue language; absent = the browser's language. */
  locale?: Locale;
  view: "liste" | "cartes";
  showSanskrit: boolean;
  panel: "postures" | "analyse" | null;
  player: {
    voice: boolean;
    voiceSanskrit: boolean;
    voiceCues: boolean;
    screenCues: boolean;
    startGong: boolean;
    changeChime: boolean;
    endChime: boolean;
    breathGuide: boolean;
    countdown: number;
    secondsPerBreath: number;
    keepAwake: boolean;
  };
  print: PrintPrefs;
}

/** Choices of the print page: a landscape grid of pose cards, or the portrait list. */
export interface PrintPrefs {
  layout: "grille" | "liste";
  /** Poses per landscape page. */
  perPage: number;
  images: boolean;
  cues: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  view: "liste",
  showSanskrit: false,
  panel: "postures",
  player: {
    voice: true,
    voiceSanskrit: false,
    voiceCues: true,
    screenCues: true,
    startGong: true,
    changeChime: true,
    endChime: true,
    breathGuide: true,
    countdown: 5,
    secondsPerBreath: 5,
    keepAwake: true,
  },
  print: { layout: "grille", perPage: 8, images: true, cues: true },
};

/** What the teacher changed on a pose (built-in or custom); applied over the catalog, never written into it. */
export type PoseEdit = Partial<
  Pick<Pose, "nameFr" | "sanskrit" | "nameEn" | "description" | "benefits" | "contraindications" | "level" | "categories" | "sided">
> & { details?: PoseDetails };

export interface Backup {
  app: "flow-creator";
  version: 1;
  exportedAt: string;
  plans: ClassPlan[];
  customPoses: Pose[];
  poseNotes: Record<string, string>;
  /** Absent from backups made before pose sheets became editable. */
  poseEdits?: Record<string, PoseEdit>;
  /** Absent from backups made before saved sequences existed. */
  sequences?: SavedSequence[];
}

interface State {
  plans: ClassPlan[];
  customPoses: Pose[];
  /** Notes personnelles de la prof, par posture. */
  poseNotes: Record<string, string>;
  poseEdits: Record<string, PoseEdit>;
  sequences: SavedSequence[];
  prefs: Prefs;
  createPlan: () => string;
  duplicatePlan: (id: string) => string | undefined;
  deletePlan: (id: string) => void;
  updatePlan: (id: string, patch: Partial<Omit<ClassPlan, "id">>) => void;
  setSections: (id: string, sections: Section[]) => void;
  addCustomPose: (pose: Omit<Pose, "id" | "custom" | "name">) => string;
  deleteCustomPose: (id: string) => void;
  setPoseNote: (poseId: string, note: string) => void;
  setPoseEdit: (poseId: string, edit: PoseEdit) => void;
  resetPoseEdit: (poseId: string) => void;
  saveSequence: (title: string, items: SequenceItem[]) => string;
  deleteSequence: (id: string) => void;
  setPrefs: (
    patch: Partial<Omit<Prefs, "player" | "print">> & {
      player?: Partial<Prefs["player"]>;
      print?: Partial<PrintPrefs>;
    },
  ) => void;
  restore: (backup: Backup) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      plans: [],
      customPoses: [],
      poseNotes: {},
      poseEdits: {},
      sequences: [],
      prefs: DEFAULT_PREFS,
      createPlan: () => {
        const plan = newPlan(get().prefs.locale ?? detectLocale());
        set((s) => ({ plans: [plan, ...s.plans] }));
        return plan.id;
      },
      duplicatePlan: (id) => {
        const src = get().plans.find((p) => p.id === id);
        if (!src) return undefined;
        const copy: ClassPlan = {
          ...structuredClone(src),
          id: uid(),
          title: `${src.title} ${COPY_SUFFIX[get().prefs.locale ?? detectLocale()]}`,
          createdAt: now(),
          updatedAt: now(),
        };
        copy.sections = copy.sections.map((sec) => ({
          ...sec,
          id: uid(),
          items: sec.items.map((it) => ({ ...it, id: uid() })),
        }));
        set((s) => ({ plans: [copy, ...s.plans] }));
        return copy.id;
      },
      deletePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
      updatePlan: (id, patch) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p)),
        })),
      setSections: (id, sections) => get().updatePlan(id, { sections }),
      addCustomPose: (pose) => {
        const id = `perso-${uid().slice(0, 8)}`;
        set((s) => ({ customPoses: [...s.customPoses, { ...pose, name: pose.nameFr, id, custom: true }] }));
        return id;
      },
      deleteCustomPose: (id) =>
        set((s) => ({ customPoses: s.customPoses.filter((p) => p.id !== id) })),
      setPoseNote: (poseId, note) =>
        set((s) => ({ poseNotes: { ...s.poseNotes, [poseId]: note } })),
      setPoseEdit: (poseId, edit) => set((s) => ({ poseEdits: { ...s.poseEdits, [poseId]: edit } })),
      resetPoseEdit: (poseId) =>
        set((s) => {
          const rest = { ...s.poseEdits };
          delete rest[poseId];
          return { poseEdits: rest };
        }),
      saveSequence: (title, items) => {
        const id = uid();
        const stored = items.map(({ poseId, hold, unit, side, breath, cue }) => ({ poseId, hold, unit, side, breath, cue }));
        set((s) => ({ sequences: [{ id, title, items: stored, createdAt: now() }, ...s.sequences] }));
        return id;
      },
      deleteSequence: (id) => set((s) => ({ sequences: s.sequences.filter((q) => q.id !== id) })),
      setPrefs: (patch) =>
        set((s) => ({
          prefs: {
            ...s.prefs,
            ...patch,
            player: { ...s.prefs.player, ...patch.player },
            print: { ...s.prefs.print, ...patch.print },
          },
        })),
      restore: (backup) =>
        set({
          plans: backup.plans.map((p) => ({ ...p, style: p.style ?? "vinyasa", targetMinutes: p.targetMinutes ?? 60 })),
          customPoses: backup.customPoses,
          poseNotes: backup.poseNotes ?? {},
          poseEdits: backup.poseEdits ?? {},
          sequences: backup.sequences ?? [],
        }),
    }),
    {
      name: "flow-creator",
      version: 4,
      // v1 plans had no style or target duration; v2 had no pose edits; v3 had no saved sequences or prefs.
      migrate: (persisted, version) => {
        const state = persisted as Pick<State, "plans" | "customPoses" | "poseNotes" | "poseEdits" | "sequences" | "prefs">;
        if (version < 2) {
          state.plans = state.plans.map((p) => ({ ...p, style: p.style ?? "vinyasa", targetMinutes: p.targetMinutes ?? 60 }));
        }
        if (version < 3) state.poseEdits = {};
        if (version < 4) {
          state.sequences = [];
          state.prefs = DEFAULT_PREFS;
        }
        return state as State;
      },
      // Prefs saved by an older build may lack newer keys; nothing is persisted yet on a first visit.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...p,
          prefs: {
            ...DEFAULT_PREFS,
            ...p.prefs,
            player: { ...DEFAULT_PREFS.player, ...p.prefs?.player },
            print: { ...DEFAULT_PREFS.print, ...p.prefs?.print },
          },
        };
      },
    },
  ),
);

/** Avoid hydration mismatches: render store-dependent UI only after localStorage is loaded. */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useStore.persist.onFinishHydration(onChange),
    () => useStore.persist.hasHydrated(),
    () => false,
  );
}

/** Applies a teacher's edit over a pose; details are merged field by field. Her own name wins in every language. */
export function applyEdit(pose: Pose, edit: PoseEdit | undefined): Pose {
  if (!edit) return pose;
  return { ...pose, ...edit, ...(edit.nameFr && { name: edit.nameFr }), details: mergeDetails(pose.details, edit.details) };
}

/** Built-in catalogue in the active language; re-renders once that language's texts are loaded. */
export function useCatalog(): Pose[] {
  const locale = useStore((s) => s.prefs.locale) ?? detectLocale();
  // Texts loaded for a language; until then the catalogue renders with what is already loaded.
  const [fetched, setFetched] = useState<{ locale: Locale; content: LocaleContent } | null>(null);
  const content = fetched?.locale === locale ? fetched.content : loadedContent(locale);
  useEffect(() => {
    let live = true;
    loadContent(locale).then((c) => live && setFetched({ locale, content: c }));
    return () => {
      live = false;
    };
  }, [locale]);
  return useMemo(() => buildCatalog(locale, content), [locale, content]);
}

/** Catalog + custom poses, with the teacher's edits applied. */
export function useAllPoses(): Pose[] {
  const catalog = useCatalog();
  const custom = useStore((s) => s.customPoses);
  const edits = useStore((s) => s.poseEdits);
  return useMemo(() => {
    // Custom poses saved before display names existed have no `name`: their own name is the French one.
    const all = custom.length ? [...catalog, ...custom.map((p) => ({ ...p, name: p.nameFr }))] : catalog;
    return Object.keys(edits).length ? all.map((p) => applyEdit(p, edits[p.id])) : all;
  }, [catalog, custom, edits]);
}

export function usePoseMap(): Map<string, Pose> {
  const poses = useAllPoses();
  return useMemo(() => new Map(poses.map((p) => [p.id, p])), [poses]);
}

export function parseBackup(raw: unknown): Backup | string {
  if (typeof raw !== "object" || raw === null) return "Fichier invalide.";
  const b = raw as Partial<Backup>;
  if (b.app !== "flow-creator") return "Ce fichier n'est pas une sauvegarde Flow Creator.";
  if (b.version !== 1) return `Version de sauvegarde non prise en charge : ${String(b.version)}.`;
  if (!Array.isArray(b.plans) || !Array.isArray(b.customPoses)) return "Sauvegarde incomplète.";
  return b as Backup;
}
