"use client";

import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookmarkPlus,
  ChevronLeft,
  Clock,
  CopyPlus,
  Ellipsis,
  Keyboard,
  Languages,
  LayoutGrid,
  LayoutTemplate,
  Library,
  List,
  ListChecks,
  Play,
  Plus,
  Printer,
  Redo2,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { BulkBar } from "@/components/BulkBar";
import { FlowCard, FlowRow } from "@/components/FlowCard";
import { ItemEditor } from "@/components/ItemEditor";
import { FlowStrip } from "@/components/FlowStrip";
import { PickerPanel } from "@/components/PickerPanel";
import { DURATIONS, GeneratorDialog, Modal, TemplatesDialog } from "@/components/StartPanels";
import { MenuItem, Popover } from "@/components/ui/Popover";
import { Toast, useToast } from "@/components/ui/Toast";
import { analyzeFlow } from "@/lib/analytics";
import { formatDuration, planSeconds, sectionSeconds } from "@/lib/duration";
import { generatePlan, isAutoTitle, suggestNext } from "@/lib/generator";
import { format, useLabels, useLocale, useMessages } from "@/lib/i18n";
import { newItem, useAllPoses, useHydrated, usePoseMap, useStore } from "@/lib/store";
import { sectionsFromSteps, TEMPLATES, type Template } from "@/lib/templates";
import type { ClassPlan, ClassStyle, Level, Pose, Section, SequenceItem } from "@/lib/types";

const M = {
  fr: {
    notFound: "Cours introuvable", backToClasses: "Retour à mes cours", undo: "Annuler", undoHint: "Annuler (⌘Z)", redo: "Rétablir",
    redoHint: "Rétablir (⇧⌘Z)", newClass: "Nouveau cours", start: "Lancer", startClass: "Lancer le cours", listView: "Vue liste",
    cardView: "Vue cartes", analysis: "Analyse", moreActions: "Plus d'actions", yes: "Oui", no: "Non", sanskritNames: "Noms sanskrits",
    generate: "Générer un cours…", templates: "Cours prêts à l'emploi…", selectAll: "Tout sélectionner", print: "Imprimer / PDF",
    duplicateClass: "Dupliquer le cours", shortcuts: "Raccourcis clavier", confirmDelete: "Supprimer « {title} » ?", thisClass: "ce cours",
    deleteClass: "Supprimer le cours", addPoses: "Ajouter des postures", library: "Bibliothèque de postures", titlePlaceholder: "Titre du cours",
    intentionPlaceholder: "Intention ou description du cours…", intention: "Intention", style: "Style", level: "Niveau",
    targetDuration: "Durée visée", poses: "{n} posture(s)", hideNotes: "Masquer les notes", themeNotes: "Thème & notes",
    themePlaceholder: "Thème (ex. Ancrage, Ouverture du cœur…)", notesPlaceholder: "Notes (accessoires, musique, élèves à surveiller…)",
    sectionName: "Nom de la section", addsHere: "Les ajouts arrivent ici", sectionOptions: "Options de {title}",
    selectSection: "Sélectionner la section", saveAsSequence: "Enregistrer en enchaînement", moveUp: "Monter", moveDown: "Descendre",
    sectionDeleted: "Section « {title} » supprimée", deleteSection: "Supprimer la section",
    emptySection: "Section vide : glisse une posture ici ou", addSection: "Ajouter une section", posesButton: "Postures",
    defaultSection: "Séquence", newSection: "Nouvelle section",
    poseAdded: "{name} ajoutée", itemsAdded: "« {label} » ajouté ({n} postures)", copied: "{n} posture(s) copiée(s)",
    cut: "{n} coupée(s)", pasted: "{n} collée(s)", duplicated: "{n} dupliquée(s)", removed: "{n} retirée(s)",
    poseRemoved: "{name} retirée", aPoseRemoved: "Posture retirée", pose: "Posture",
    mySequence: "Mon enchaînement", sequenceName: "Nom de l'enchaînement", sequenceSaved: "Enchaînement « {title} » enregistré",
    confirmReplace: "Remplacer la séquence actuelle ?", classLoaded: "Cours chargé",
    keys: {
      undoRedo: "Annuler / rétablir", selectAll: "Tout sélectionner", shiftClick: "Maj + clic", range: "Sélectionner une plage",
      clipboard: "Copier / couper / coller", duplicate: "Dupliquer la sélection", del: "Suppr", remove: "Retirer la sélection",
      esc: "Échap", clear: "Tout désélectionner",
    },
    empty: {
      eyebrow: "Nouveau cours", heading: "Comment veux-tu commencer ?", generate: "Générer",
      generateText: "Style, niveau, durée : la séquence complète est construite pour toi.", template: "Cours prêt à l'emploi",
      templateText: "Un modèle équilibré, chargé en un clic.", compose: "Composer moi-même",
      composeText: "Postures et enchaînements depuis la bibliothèque.", popular: "Populaires :",
    },
  },
  en: {
    notFound: "Class not found", backToClasses: "Back to my classes", undo: "Undo", undoHint: "Undo (⌘Z)", redo: "Redo",
    redoHint: "Redo (⇧⌘Z)", newClass: "New class", start: "Start", startClass: "Start the class", listView: "List view",
    cardView: "Card view", analysis: "Analysis", moreActions: "More actions", yes: "On", no: "Off", sanskritNames: "Sanskrit names",
    generate: "Generate a class…", templates: "Ready-made classes…", selectAll: "Select all", print: "Print / PDF",
    duplicateClass: "Duplicate class", shortcuts: "Keyboard shortcuts", confirmDelete: "Delete “{title}”?", thisClass: "this class",
    deleteClass: "Delete class", addPoses: "Add poses", library: "Pose library", titlePlaceholder: "Class title",
    intentionPlaceholder: "Intention or class description…", intention: "Intention", style: "Style", level: "Level",
    targetDuration: "Target duration", poses: "{n} pose(s)", hideNotes: "Hide notes", themeNotes: "Theme & notes",
    themePlaceholder: "Theme (e.g. Grounding, Heart opening…)", notesPlaceholder: "Notes (props, music, students to watch…)",
    sectionName: "Section name", addsHere: "New poses go here", sectionOptions: "{title} options",
    selectSection: "Select section", saveAsSequence: "Save as sequence", moveUp: "Move up", moveDown: "Move down",
    sectionDeleted: "Section “{title}” deleted", deleteSection: "Delete section",
    emptySection: "Empty section: drag a pose here or", addSection: "Add a section", posesButton: "Poses",
    defaultSection: "Sequence", newSection: "New section",
    poseAdded: "{name} added", itemsAdded: "“{label}” added ({n} poses)", copied: "{n} pose(s) copied",
    cut: "{n} cut", pasted: "{n} pasted", duplicated: "{n} duplicated", removed: "{n} removed",
    poseRemoved: "{name} removed", aPoseRemoved: "Pose removed", pose: "Pose",
    mySequence: "My sequence", sequenceName: "Sequence name", sequenceSaved: "Sequence “{title}” saved",
    confirmReplace: "Replace the current sequence?", classLoaded: "Class loaded",
    keys: {
      undoRedo: "Undo / redo", selectAll: "Select all", shiftClick: "Shift + click", range: "Select a range",
      clipboard: "Copy / cut / paste", duplicate: "Duplicate selection", del: "Delete", remove: "Remove selection",
      esc: "Esc", clear: "Deselect all",
    },
    empty: {
      eyebrow: "New class", heading: "How would you like to start?", generate: "Generate",
      generateText: "Style, level, duration: the full sequence is built for you.", template: "Ready-made class",
      templateText: "A balanced template, loaded in one click.", compose: "Build it myself",
      composeText: "Poses and sequences from the library.", popular: "Popular:",
    },
  },
  es: {
    notFound: "Clase no encontrada", backToClasses: "Volver a mis clases", undo: "Deshacer", undoHint: "Deshacer (⌘Z)", redo: "Rehacer",
    redoHint: "Rehacer (⇧⌘Z)", newClass: "Nueva clase", start: "Empezar", startClass: "Empezar la clase", listView: "Vista de lista",
    cardView: "Vista de tarjetas", analysis: "Análisis", moreActions: "Más acciones", yes: "Sí", no: "No", sanskritNames: "Nombres en sánscrito",
    generate: "Generar una clase…", templates: "Clases listas para usar…", selectAll: "Seleccionar todo", print: "Imprimir / PDF",
    duplicateClass: "Duplicar la clase", shortcuts: "Atajos de teclado", confirmDelete: "¿Eliminar «{title}»?", thisClass: "esta clase",
    deleteClass: "Eliminar la clase", addPoses: "Añadir posturas", library: "Biblioteca de posturas", titlePlaceholder: "Título de la clase",
    intentionPlaceholder: "Intención o descripción de la clase…", intention: "Intención", style: "Estilo", level: "Nivel",
    targetDuration: "Duración prevista", poses: "{n} postura(s)", hideNotes: "Ocultar las notas", themeNotes: "Tema y notas",
    themePlaceholder: "Tema (p. ej. Enraizamiento, Apertura del corazón…)", notesPlaceholder: "Notas (accesorios, música, alumnos a vigilar…)",
    sectionName: "Nombre de la sección", addsHere: "Lo añadido llega aquí", sectionOptions: "Opciones de {title}",
    selectSection: "Seleccionar la sección", saveAsSequence: "Guardar como secuencia", moveUp: "Subir", moveDown: "Bajar",
    sectionDeleted: "Sección «{title}» eliminada", deleteSection: "Eliminar la sección",
    emptySection: "Sección vacía: arrastra una postura aquí o", addSection: "Añadir una sección", posesButton: "Posturas",
    defaultSection: "Secuencia", newSection: "Nueva sección",
    poseAdded: "{name} añadida", itemsAdded: "«{label}» añadido ({n} posturas)", copied: "{n} postura(s) copiada(s)",
    cut: "{n} cortada(s)", pasted: "{n} pegada(s)", duplicated: "{n} duplicada(s)", removed: "{n} quitada(s)",
    poseRemoved: "{name} quitada", aPoseRemoved: "Postura quitada", pose: "Postura",
    mySequence: "Mi secuencia", sequenceName: "Nombre de la secuencia", sequenceSaved: "Secuencia «{title}» guardada",
    confirmReplace: "¿Reemplazar la secuencia actual?", classLoaded: "Clase cargada",
    keys: {
      undoRedo: "Deshacer / rehacer", selectAll: "Seleccionar todo", shiftClick: "Mayús + clic", range: "Seleccionar un rango",
      clipboard: "Copiar / cortar / pegar", duplicate: "Duplicar la selección", del: "Supr", remove: "Quitar la selección",
      esc: "Esc", clear: "Deseleccionar todo",
    },
    empty: {
      eyebrow: "Nueva clase", heading: "¿Cómo quieres empezar?", generate: "Generar",
      generateText: "Estilo, nivel, duración: la secuencia completa se construye para ti.", template: "Clase lista para usar",
      templateText: "Una plantilla equilibrada, cargada en un clic.", compose: "Crearla yo",
      composeText: "Posturas y secuencias desde la biblioteca.", popular: "Populares:",
    },
  },
};

const plural = (template: string, n: number) => format(template.replace(/\((\w+)\)/g, n > 1 ? "$1" : ""), { n });

const uid = () => crypto.randomUUID();
type Panel = "postures" | "analyse";

export default function FlowBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const m = useMessages(M);
  const plan = useStore((s) => s.plans.find((p) => p.id === id));
  if (!hydrated) return null;
  if (!plan)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-display text-2xl">{m.notFound}</p>
        <Link href="/" className="btn-primary mt-4">
          {m.backToClasses}
        </Link>
      </div>
    );
  return <Builder key={plan.id} plan={plan} />;
}

function DropZone({ id, className, children }: { id: string; className: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <ul ref={setNodeRef} className={`${className} ${isOver ? "ring-2 ring-accent/30" : ""}`}>
      {children}
    </ul>
  );
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

function Builder({ plan }: { plan: ClassPlan }) {
  const router = useRouter();
  const m = useMessages(M);
  const L = useLabels();
  const locale = useLocale();
  const updatePlan = useStore((s) => s.updatePlan);
  const deletePlan = useStore((s) => s.deletePlan);
  const duplicatePlan = useStore((s) => s.duplicatePlan);
  const saveSequence = useStore((s) => s.saveSequence);
  const prefs = useStore((s) => s.prefs);
  const setPrefs = useStore((s) => s.setPrefs);
  const poses = useAllPoses();
  const poseMap = usePoseMap();
  const { toast, show, hide } = useToast();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<SequenceItem[]>([]);
  const [highlight, setHighlight] = useState<Set<string> | null>(null);
  const [dialog, setDialog] = useState<"generate" | "templates" | "shortcuts" | null>(null);
  const [mobilePanel, setMobilePanel] = useState<Panel | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [suggestSeed, setSuggestSeed] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [hist, setHist] = useState({ canUndo: false, canRedo: false });
  const history = useRef<{ past: Section[][]; future: Section[][] }>({ past: [], future: [] });
  const dragStart = useRef<Section[] | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sections = plan.sections;
  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const count = flat.length;
  const total = planSeconds(plan);
  const analysis = useMemo(() => analyzeFlow(plan, poseMap), [plan, poseMap]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of flat) m.set(it.poseId, (m.get(it.poseId) ?? 0) + 1);
    return m;
  }, [flat]);
  // Default target: the last section already holding poses, else the first one (an empty plan fills from the top).
  const activeId =
    activeSection && sections.some((s) => s.id === activeSection)
      ? activeSection
      : ([...sections].reverse().find((s) => s.items.length) ?? sections[0])?.id;
  const lastPose = useMemo(() => {
    const sec = sections.find((s) => s.id === activeId);
    const last = sec?.items.at(-1) ?? flat.at(-1);
    return last ? poseMap.get(last.poseId) : undefined;
  }, [sections, activeId, flat, poseMap]);
  const suggestions = useMemo(
    () => suggestNext(lastPose, poses, plan.level, new Set(flat.map((it) => it.poseId))),
    // suggestSeed reshuffles on demand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lastPose, poses, plan.level, flat, suggestSeed],
  );

  // ----- Writes with history (reads the store's current state to stay correct in deferred callbacks)
  const current = () => useStore.getState().plans.find((p) => p.id === plan.id)?.sections ?? [];
  const write = (next: Section[]) => updatePlan(plan.id, { sections: next });
  const syncHist = () => setHist({ canUndo: history.current.past.length > 0, canRedo: history.current.future.length > 0 });
  const commit = (next: Section[]) => {
    history.current.past = [...history.current.past.slice(-80), current()];
    history.current.future = [];
    write(next);
    syncHist();
  };
  const undo = () => {
    const prev = history.current.past.pop();
    if (!prev) return;
    history.current.future.push(current());
    write(prev);
    syncHist();
  };
  const redo = () => {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(current());
    write(next);
    syncHist();
  };
  const undoAction = { label: m.undo, run: undo };

  const patch = (p: Partial<Omit<ClassPlan, "id">>) => updatePlan(plan.id, p);
  const mapItems = (secs: Section[], fn: (it: SequenceItem) => SequenceItem) =>
    secs.map((s) => ({ ...s, items: s.items.map(fn) }));
  const inOrder = (ids: Set<string>) => current().flatMap((s) => s.items).filter((it) => ids.has(it.id));

  /** Inserts after an item, else at the end of the active section. */
  const insert = (items: SequenceItem[], afterId?: string | null) => {
    const secs = current();
    if (!secs.length) return commit([{ id: uid(), title: m.defaultSection, items }]);
    const host = afterId ? secs.find((s) => s.items.some((it) => it.id === afterId)) : undefined;
    const target = host ?? secs.find((s) => s.id === activeId) ?? secs[secs.length - 1];
    commit(
      secs.map((s) => {
        if (s.id !== target.id) return s;
        const at = host ? s.items.findIndex((it) => it.id === afterId) + 1 : s.items.length;
        return { ...s, items: [...s.items.slice(0, at), ...items, ...s.items.slice(at)] };
      }),
    );
    requestAnimationFrame(() =>
      document.querySelector(`[data-item="${items[0]?.id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
    );
  };

  const addPose = (pose: Pose) => {
    insert([newItem(pose)]);
    show(format(m.poseAdded, { name: pose.name }), undoAction);
  };
  const addItems = (items: SequenceItem[], label: string) => {
    insert(items);
    show(format(m.itemsAdded, { label, n: items.length }), undoAction);
  };

  const updateItem = (id: string, p: Partial<SequenceItem>) => {
    const next = mapItems(current(), (it) => (it.id === id ? { ...it, ...p } : it));
    // Typing a cue should not fill the undo history letter by letter.
    if (Object.keys(p).length === 1 && "cue" in p) write(next);
    else commit(next);
  };
  const removeIds = (ids: Set<string>, label: string) => {
    if (!ids.size) return;
    commit(current().map((s) => ({ ...s, items: s.items.filter((it) => !ids.has(it.id)) })));
    setSelected((prev) => new Set([...prev].filter((x) => !ids.has(x))));
    show(label, undoAction);
  };

  // ----- Sélection
  const check = (id: string, shift: boolean) => {
    if (shift && anchor) {
      const ids = flat.map((it) => it.id);
      const [a, b] = [ids.indexOf(anchor), ids.indexOf(id)].sort((x, y) => x - y);
      if (a >= 0) {
        setSelected((prev) => new Set([...prev, ...ids.slice(a, b + 1)]));
        setAnchor(id);
        return;
      }
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setAnchor(id);
  };
  const clearSelection = () => setSelected(new Set());
  const lastSelectedId = () => inOrder(selected).at(-1)?.id;
  const clone = (items: SequenceItem[]) => items.map((it) => ({ ...it, id: uid() }));

  const copySel = () => {
    const items = inOrder(selected);
    setClipboard(items);
    show(plural(m.copied, items.length));
  };
  const cutSel = () => {
    const items = inOrder(selected);
    setClipboard(items);
    removeIds(new Set(items.map((it) => it.id)), plural(m.cut, items.length));
  };
  const paste = () => {
    if (!clipboard.length) return;
    insert(clone(clipboard), lastSelectedId());
    show(plural(m.pasted, clipboard.length), undoAction);
  };
  const duplicateSel = () => {
    const items = inOrder(selected);
    insert(clone(items), items.at(-1)?.id);
    show(plural(m.duplicated, items.length), undoAction);
  };
  const saveSel = (items = inOrder(selected), fallback = m.mySequence) => {
    if (!items.length) return;
    const title = prompt(m.sequenceName, fallback)?.trim();
    if (!title) return;
    saveSequence(title, items);
    show(format(m.sequenceSaved, { title }));
  };
  const bulk = (p: Partial<SequenceItem>) => commit(mapItems(current(), (it) => (selected.has(it.id) ? { ...it, ...p } : it)));

  // ----- Glisser-déposer entre sections
  const findContainer = (secs: Section[], id: string) =>
    secs.find((s) => s.id === id || s.items.some((it) => it.id === id))?.id;
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const secs = current();
    const from = findContainer(secs, String(active.id));
    const to = findContainer(secs, String(over.id));
    if (!from || !to || from === to) return;
    const moving = secs.find((s) => s.id === from)!.items.find((it) => it.id === active.id)!;
    const toItems = secs.find((s) => s.id === to)!.items;
    const overIndex = toItems.findIndex((it) => it.id === over.id);
    const at = overIndex >= 0 ? overIndex : toItems.length;
    write(
      secs.map((s) => {
        if (s.id === from) return { ...s, items: s.items.filter((it) => it.id !== active.id) };
        if (s.id === to) return { ...s, items: [...s.items.slice(0, at), moving, ...s.items.slice(at)] };
        return s;
      }),
    );
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const before = dragStart.current;
    dragStart.current = null;
    let secs = current();
    const container = over && findContainer(secs, String(active.id));
    if (over && container && container === findContainer(secs, String(over.id))) {
      secs = secs.map((s) => {
        if (s.id !== container) return s;
        const from = s.items.findIndex((it) => it.id === active.id);
        const to = s.items.findIndex((it) => it.id === over.id);
        return to < 0 || from === to ? s : { ...s, items: arrayMove(s.items, from, to) };
      });
    }
    if (before && JSON.stringify(before) !== JSON.stringify(secs)) {
      history.current.past = [...history.current.past.slice(-80), before];
      history.current.future = [];
      syncHist();
    }
    write(secs);
  };

  // ----- Remplacement complet (générateur, modèles)
  const replaceSections = (next: Pick<ClassPlan, "sections"> & Partial<ClassPlan>) => {
    if (count > 0 && !confirm(m.confirmReplace)) return;
    const autoTitle = !plan.title || isAutoTitle(plan.title);
    history.current.past.push(current());
    history.current.future = [];
    syncHist();
    patch({ ...next, title: autoTitle ? (next.title ?? "") : plan.title });
    clearSelection();
    setActiveSection(null);
    setDialog(null);
    show(m.classLoaded, undoAction);
  };
  const isSided = (pid: string) => poseMap.get(pid)?.sided ?? false;
  const loadTemplate = (t: Template) =>
    replaceSections({
      sections: sectionsFromSteps(t.sections, isSided, locale),
      title: t.title[locale],
      style: t.style,
      level: t.level,
      targetMinutes: t.targetMinutes,
      theme: plan.theme || t.theme[locale],
    });
  const templateDuration = (t: Template) => planSeconds({ sections: sectionsFromSteps(t.sections, isSided, locale) } as ClassPlan);

  // ----- Panneaux
  const openPanel = (p: Panel) => {
    if (window.matchMedia("(min-width: 1024px)").matches) setPrefs({ panel: prefs.panel === p ? null : p });
    else setMobilePanel(mobilePanel === p ? null : p);
  };
  /** `fullScreen`: the panel covers the editor (below lg), so the picker shows the class being built. */
  const panelFor = (p: Panel, close: () => void, fullScreen = false) =>
    p === "postures" ? (
      <PickerPanel
        counts={counts}
        onPick={addPose}
        onAddItems={addItems}
        suggestions={suggestions}
        suggestFor={lastPose?.name ?? null}
        onRefreshSuggestions={() => setSuggestSeed((n) => n + 1)}
        onClose={close}
        footer={
          fullScreen && (
            <FlowStrip sections={sections} targetId={activeId} poseMap={poseMap} totalSeconds={total} onDone={close} />
          )
        }
      />
    ) : (
      <AnalyticsPanel
        analysis={analysis}
        targetMinutes={plan.targetMinutes}
        poseOf={(itemId) => poseMap.get(flat.find((it) => it.id === itemId)?.poseId ?? "")}
        onHighlight={(ids) => setHighlight(ids ? new Set(ids) : null)}
        onClose={close}
      />
    );

  // ----- Raccourcis clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || dialog) return;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && k === "y") {
        e.preventDefault();
        redo();
      } else if (mod && k === "a") {
        e.preventDefault();
        setSelected(new Set(flat.map((it) => it.id)));
      } else if (mod && k === "c" && selected.size) copySel();
      else if (mod && k === "x" && selected.size) cutSel();
      else if (mod && k === "v" && clipboard.length) paste();
      else if (mod && k === "d" && selected.size) {
        e.preventDefault();
        duplicateSel();
      } else if ((e.key === "Backspace" || e.key === "Delete") && selected.size) {
        e.preventDefault();
        removeIds(new Set(selected), plural(m.removed, selected.size));
      } else if (e.key === "Escape") {
        clearSelection();
        setExpanded(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const over = total > plan.targetMinutes * 60 * 1.1;
  const under = count > 0 && total < plan.targetMinutes * 60 * 0.8;
  const ratio = Math.min(1, total / (plan.targetMinutes * 60));
  const offsets = sections.map((_, i) => sections.slice(0, i).reduce((n, s) => n + s.items.length, 0));
  const peakId = analysis.peak?.item.id;
  const panel = prefs.panel;

  return (
    <div className="flex flex-1 flex-col">
      {/* Barre d'outils */}
      <div className="no-print sticky top-14 z-20 border-b border-line/70 bg-background/85 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-1 px-2 sm:px-4">
          <Link href="/" className="icon-btn" aria-label={m.backToClasses}>
            <ChevronLeft size={20} />
          </Link>
          <button className="icon-btn" onClick={undo} disabled={!hist.canUndo} aria-label={m.undo} title={m.undoHint}>
            <Undo2 size={18} />
          </button>
          <button className="icon-btn" onClick={redo} disabled={!hist.canRedo} aria-label={m.redo} title={m.redoHint}>
            <Redo2 size={18} />
          </button>
          <div className="mx-auto flex min-w-0 items-center gap-2 px-2">
            <span className="hidden truncate font-semibold sm:block">{plan.title || m.newClass}</span>
            <Link
              href={`/cours/${plan.id}/jouer`}
              aria-label={m.startClass}
              title={m.startClass}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-accent pr-3.5 pl-3 text-sm font-bold text-surface shadow-soft transition hover:bg-accent-strong ${
                count ? "" : "pointer-events-none opacity-40"
              }`}
            >
              <Play size={15} fill="currentColor" /> {m.start}
            </Link>
          </div>
          <div className="hidden rounded-full bg-surface-2 p-0.5 sm:flex">
            <button className="icon-btn h-8 w-8" data-active={prefs.view === "liste"} onClick={() => setPrefs({ view: "liste" })} aria-label={m.listView}>
              <List size={17} />
            </button>
            <button className="icon-btn h-8 w-8" data-active={prefs.view === "cartes"} onClick={() => setPrefs({ view: "cartes" })} aria-label={m.cardView}>
              <LayoutGrid size={17} />
            </button>
          </div>
          <button className="icon-btn" data-active={panel === "analyse" || mobilePanel === "analyse"} onClick={() => openPanel("analyse")} aria-label={m.analysis} title={m.analysis}>
            <BarChart3 size={18} />
          </button>
          <Popover
            align="end"
            className="w-64"
            trigger={({ open, toggle }) => (
              <button className="icon-btn" data-active={open} onClick={toggle} aria-label={m.moreActions}>
                <Ellipsis size={18} />
              </button>
            )}
          >
            {(close) => (
              <div role="menu">
                <MenuItem icon={<Languages size={15} />} onClick={() => setPrefs({ showSanskrit: !prefs.showSanskrit })} hint={prefs.showSanskrit ? m.yes : m.no}>
                  {m.sanskritNames}
                </MenuItem>
                <MenuItem
                  icon={prefs.view === "liste" ? <LayoutGrid size={15} /> : <List size={15} />}
                  onClick={() => {
                    setPrefs({ view: prefs.view === "liste" ? "cartes" : "liste" });
                    close();
                  }}
                >
                  {prefs.view === "liste" ? m.cardView : m.listView}
                </MenuItem>
                <div className="my-1 h-px bg-line" />
                <MenuItem icon={<Sparkles size={15} />} onClick={() => (close(), setDialog("generate"))}>
                  {m.generate}
                </MenuItem>
                <MenuItem icon={<LayoutTemplate size={15} />} onClick={() => (close(), setDialog("templates"))}>
                  {m.templates}
                </MenuItem>
                <MenuItem icon={<ListChecks size={15} />} onClick={() => (close(), setSelected(new Set(flat.map((it) => it.id))))} hint="⌘A">
                  {m.selectAll}
                </MenuItem>
                <MenuItem icon={<Printer size={15} />} onClick={() => router.push(`/cours/${plan.id}/imprimer`)}>
                  {m.print}
                </MenuItem>
                <MenuItem
                  icon={<CopyPlus size={15} />}
                  onClick={() => {
                    const copy = duplicatePlan(plan.id);
                    if (copy) router.push(`/cours/${copy}`);
                  }}
                >
                  {m.duplicateClass}
                </MenuItem>
                <MenuItem icon={<Keyboard size={15} />} onClick={() => (close(), setDialog("shortcuts"))}>
                  {m.shortcuts}
                </MenuItem>
                <div className="my-1 h-px bg-line" />
                <MenuItem
                  danger
                  icon={<Trash2 size={15} />}
                  onClick={() => {
                    if (!confirm(format(m.confirmDelete, { title: plan.title || m.thisClass }))) return;
                    deletePlan(plan.id);
                    router.push("/");
                  }}
                >
                  {m.deleteClass}
                </MenuItem>
              </div>
            )}
          </Popover>
          <button
            className="icon-btn bg-accent-soft text-accent hover:bg-accent hover:text-surface"
            data-active={panel === "postures" || mobilePanel === "postures"}
            onClick={() => openPanel("postures")}
            aria-label={m.addPoses}
            title={m.library}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Cours */}
        <div className="min-w-0 flex-1 px-4 pt-6 pb-36 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <input
              className="w-full bg-transparent font-display text-3xl font-semibold tracking-tight outline-none placeholder:text-muted/40 sm:text-4xl"
              placeholder={m.titlePlaceholder}
              value={plan.title}
              onChange={(e) => patch({ title: e.target.value })}
              aria-label={m.titlePlaceholder}
            />
            <textarea
              className="mt-1 w-full resize-none bg-transparent text-muted outline-none placeholder:text-muted/50"
              rows={1}
              placeholder={m.intentionPlaceholder}
              value={plan.intention}
              onChange={(e) => patch({ intention: e.target.value })}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${t.scrollHeight}px`;
              }}
              aria-label={m.intention}
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="pill cursor-pointer">
                <select className="cursor-pointer bg-transparent outline-none" value={plan.style} onChange={(e) => patch({ style: e.target.value as ClassStyle })} aria-label={m.style}>
                  {(Object.keys(L.style) as ClassStyle[]).map((s) => (
                    <option key={s} value={s}>
                      {L.style[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pill cursor-pointer">
                <select className="cursor-pointer bg-transparent outline-none" value={plan.level} onChange={(e) => patch({ level: e.target.value as Level })} aria-label={m.level}>
                  {(Object.keys(L.level) as Level[]).map((l) => (
                    <option key={l} value={l}>
                      {L.level[l]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-2 rounded-full bg-surface-2 py-1 pr-3 pl-2.5 text-xs font-semibold">
                <Clock size={13} className={over ? "text-danger" : under ? "text-gold" : "text-accent"} />
                <span className={over ? "text-danger" : ""}>{formatDuration(total)}</span>
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
                  <span
                    className={`block h-full rounded-full ${over ? "bg-danger" : under ? "bg-gold" : "bg-accent"}`}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </span>
                <select
                  className="cursor-pointer bg-transparent text-muted outline-none"
                  value={plan.targetMinutes}
                  onChange={(e) => patch({ targetMinutes: Number(e.target.value) })}
                  aria-label={m.targetDuration}
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      / {d} min
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-xs font-semibold text-muted">
                {plural(m.poses, count)}
              </span>
              <button className="ml-auto text-xs font-semibold text-muted hover:text-foreground" onClick={() => setShowDetails((v) => !v)}>
                {showDetails ? m.hideNotes : m.themeNotes}
              </button>
            </div>
            {showDetails && (
              <div className="mt-3 grid animate-fade gap-2 sm:grid-cols-2">
                <input className="input" placeholder={m.themePlaceholder} value={plan.theme} onChange={(e) => patch({ theme: e.target.value })} />
                <textarea
                  className="input"
                  rows={2}
                  placeholder={m.notesPlaceholder}
                  value={plan.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                />
              </div>
            )}

            {count === 0 ? (
              <EmptyState
                onGenerate={() => setDialog("generate")}
                onTemplates={() => setDialog("templates")}
                onPick={() => openPanel("postures")}
                onTemplate={loadTemplate}
              />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={() => (dragStart.current = current())}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                onDragCancel={() => {
                  if (dragStart.current) write(dragStart.current);
                  dragStart.current = null;
                }}
              >
                <div className="mt-8 space-y-8">
                  {sections.map((section, index) => {
                    const active = section.id === activeId && sections.length > 1;
                    const start = offsets[index];
                    return (
                      <section key={section.id} onClick={() => setActiveSection(section.id)} aria-label={section.title}>
                        <header className="mb-2 flex items-center gap-2">
                          <span className={`h-6 w-1.5 shrink-0 rounded-full ${active ? "bg-accent" : "bg-line"}`} />
                          <input
                            className="min-w-0 flex-1 bg-transparent font-display text-xl font-semibold outline-none"
                            value={section.title}
                            onChange={(e) => write(current().map((s) => (s.id === section.id ? { ...s, title: e.target.value } : s)))}
                            aria-label={m.sectionName}
                          />
                          {active && <span className="hidden rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent sm:inline">{m.addsHere}</span>}
                          <span className="text-xs font-semibold whitespace-nowrap text-muted">
                            {section.items.length} · {formatDuration(sectionSeconds(section))}
                          </span>
                          <Popover
                            align="end"
                            className="w-60"
                            trigger={({ open, toggle }) => (
                              <button className="icon-btn h-8 w-8" data-active={open} onClick={toggle} aria-label={format(m.sectionOptions, { title: section.title })}>
                                <Ellipsis size={16} />
                              </button>
                            )}
                          >
                            {(close) => (
                              <div role="menu">
                                <MenuItem icon={<ListChecks size={15} />} onClick={() => (close(), setSelected(new Set(section.items.map((it) => it.id))))}>
                                  {m.selectSection}
                                </MenuItem>
                                <MenuItem icon={<BookmarkPlus size={15} />} onClick={() => (close(), saveSel(section.items, section.title))}>
                                  {m.saveAsSequence}
                                </MenuItem>
                                <MenuItem
                                  icon={<ArrowUp size={15} />}
                                  onClick={() => (close(), index > 0 && commit(arrayMove(current(), index, index - 1)))}
                                >
                                  {m.moveUp}
                                </MenuItem>
                                <MenuItem
                                  icon={<ArrowDown size={15} />}
                                  onClick={() => (close(), index < sections.length - 1 && commit(arrayMove(current(), index, index + 1)))}
                                >
                                  {m.moveDown}
                                </MenuItem>
                                <MenuItem
                                  danger
                                  icon={<Trash2 size={15} />}
                                  onClick={() => {
                                    close();
                                    commit(current().filter((s) => s.id !== section.id));
                                    show(format(m.sectionDeleted, { title: section.title }), undoAction);
                                  }}
                                >
                                  {m.deleteSection}
                                </MenuItem>
                              </div>
                            )}
                          </Popover>
                        </header>
                        <SortableContext
                          items={section.items.map((it) => it.id)}
                          strategy={prefs.view === "liste" ? verticalListSortingStrategy : rectSortingStrategy}
                        >
                          <DropZone
                            id={section.id}
                            className={
                              prefs.view === "liste"
                                ? `min-h-16 space-y-0.5 rounded-3xl border bg-surface p-1.5 shadow-soft transition ${active ? "border-accent/40" : "border-line"}`
                                : "grid min-h-24 grid-cols-2 gap-3 rounded-3xl p-0.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
                            }
                          >
                            {section.items.map((item, i) => {
                              const props = {
                                item,
                                pose: poseMap.get(item.poseId),
                                index: start + i + 1,
                                checked: selected.has(item.id),
                                expanded: expanded === item.id,
                                highlighted: highlight?.has(item.id) ?? false,
                                isPeak: item.id === peakId,
                                showSanskrit: prefs.showSanskrit,
                                onCheck: (shift: boolean) => check(item.id, shift),
                                onToggleExpand: () => setExpanded(expanded === item.id ? null : item.id),
                                onChange: (p: Partial<SequenceItem>) => updateItem(item.id, p),
                                onRemove: () => removeIds(new Set([item.id]), format(m.poseRemoved, { name: poseMap.get(item.poseId)?.name ?? m.pose })),
                                editor: (
                                  <ItemEditor
                                    item={item}
                                    pose={poseMap.get(item.poseId)}
                                    onChange={(p) => updateItem(item.id, p)}
                                    onRemove={() => removeIds(new Set([item.id]), m.aPoseRemoved)}
                                    onDuplicate={() => insert(clone([item]), item.id)}
                                  />
                                ),
                              };
                              return prefs.view === "liste" ? <FlowRow key={item.id} {...props} /> : <FlowCard key={item.id} {...props} />;
                            })}
                            {section.items.length === 0 && (
                              <li className="col-span-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line p-5 text-center text-sm text-muted">
                                {m.emptySection}
                                <button
                                  className="btn py-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSection(section.id);
                                    openPanel("postures");
                                  }}
                                >
                                  <Plus size={14} /> {m.addPoses}
                                </button>
                              </li>
                            )}
                          </DropZone>
                        </SortableContext>
                        {prefs.view === "cartes" && expanded && section.items.some((it) => it.id === expanded) && (
                          <div className="mt-3">
                            {(() => {
                              const it = section.items.find((x) => x.id === expanded)!;
                              return (
                                <ItemEditor
                                  item={it}
                                  pose={poseMap.get(it.poseId)}
                                  onChange={(p) => updateItem(it.id, p)}
                                  onRemove={() => removeIds(new Set([it.id]), m.aPoseRemoved)}
                                  onDuplicate={() => insert(clone([it]), it.id)}
                                />
                              );
                            })()}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </DndContext>
            )}

            {count > 0 && (
              <button
                className="btn mt-6"
                onClick={() => {
                  const sec: Section = { id: uid(), title: m.newSection, items: [] };
                  commit([...current(), sec]);
                  setActiveSection(sec.id);
                }}
              >
                <Plus size={15} /> {m.addSection}
              </button>
            )}
          </div>
        </div>

        {/* Panneau latéral (grand écran) */}
        {panel && (
          <aside className="no-print sticky top-28 hidden h-[calc(100dvh-7rem)] w-[400px] shrink-0 border-l border-line bg-background lg:flex lg:flex-col xl:w-[440px]">
            {panelFor(panel, () => setPrefs({ panel: null }))}
          </aside>
        )}
      </div>

      {/* Panneau plein écran (mobile) */}
      {mobilePanel && (
        <div className="fixed inset-0 z-50 flex animate-rise flex-col bg-background lg:hidden">{panelFor(mobilePanel, () => setMobilePanel(null), true)}</div>
      )}

      {/* Bouton d'ajout flottant (mobile, ou panneau fermé) */}
      {selected.size === 0 && !mobilePanel && (
        <button
          className={`btn-primary fixed right-4 bottom-5 z-30 py-3 pr-5 pl-4 text-base shadow-lift ${panel === "postures" ? "lg:hidden" : ""}`}
          onClick={() => openPanel("postures")}
        >
          <Library size={18} /> {m.posesButton}
        </button>
      )}

      {selected.size > 0 && (
        <BulkBar
          count={selected.size}
          canPaste={clipboard.length > 0}
          onClear={clearSelection}
          onCut={cutSel}
          onCopy={copySel}
          onPaste={paste}
          onDuplicate={duplicateSel}
          onSave={() => saveSel()}
          onDelete={() => removeIds(new Set(selected), plural(m.removed, selected.size))}
          onHold={(h) => bulk(h)}
          onSide={(side) => bulk({ side })}
          onBreath={(breath) => bulk({ breath })}
        />
      )}

      {/* Raised above the bulk bar, or above the flow strip of the full-screen picker. */}
      <Toast
        toast={toast}
        onHide={hide}
        offset={mobilePanel === "postures" ? "high" : selected.size > 0 ? "raised" : "none"}
      />

      {dialog === "generate" && (
        <GeneratorDialog
          initial={{ style: plan.style, level: plan.level, targetMinutes: plan.targetMinutes }}
          onClose={() => setDialog(null)}
          onGenerate={(opts) => {
            const generated = generatePlan(opts, poses, locale);
            replaceSections({ ...generated, style: opts.style, level: opts.level, targetMinutes: opts.targetMinutes });
          }}
        />
      )}
      {dialog === "templates" && <TemplatesDialog onClose={() => setDialog(null)} onPick={loadTemplate} durationOf={templateDuration} />}
      {dialog === "shortcuts" && (
        <Modal title={m.shortcuts} icon={<Keyboard size={20} />} onClose={() => setDialog(null)}>
          <ul className="divide-y divide-line text-sm">
            {[
              ["⌘ Z / ⇧ ⌘ Z", m.keys.undoRedo],
              ["⌘ A", m.keys.selectAll],
              [m.keys.shiftClick, m.keys.range],
              ["⌘ C / ⌘ X / ⌘ V", m.keys.clipboard],
              ["⌘ D", m.keys.duplicate],
              [m.keys.del, m.keys.remove],
              [m.keys.esc, m.keys.clear],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between py-2.5">
                <span>{v}</span>
                <kbd className="rounded-lg bg-surface-2 px-2 py-1 font-sans text-xs font-bold">{k}</kbd>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}

function EmptyState({
  onGenerate,
  onTemplates,
  onPick,
  onTemplate,
}: {
  onGenerate: () => void;
  onTemplates: () => void;
  onPick: () => void;
  onTemplate: (t: Template) => void;
}) {
  const m = useMessages(M).empty;
  const locale = useLocale();
  const options = [
    { icon: <Sparkles size={22} />, title: m.generate, text: m.generateText, onClick: onGenerate, tone: "bg-accent text-surface" },
    { icon: <LayoutTemplate size={22} />, title: m.template, text: m.templateText, onClick: onTemplates, tone: "bg-lilac-soft text-lilac" },
    { icon: <Library size={22} />, title: m.compose, text: m.composeText, onClick: onPick, tone: "bg-clay-soft text-clay" },
  ];
  return (
    <div className="mt-8 rounded-[2rem] border border-line bg-surface p-6 text-center shadow-soft sm:p-10">
      <p className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">{m.eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{m.heading}</h2>
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <button
            key={o.title}
            onClick={o.onClick}
            className="group flex flex-col items-center gap-3 rounded-3xl border border-line bg-background p-6 transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift"
          >
            <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${o.tone} transition group-hover:scale-105`}>{o.icon}</span>
            <span className="font-display text-lg font-semibold">{o.title}</span>
            <span className="text-sm text-muted">{o.text}</span>
          </button>
        ))}
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="font-semibold text-muted">{m.popular}</span>
        {TEMPLATES.map((t) => (
          <button key={t.id} className="chip" onClick={() => onTemplate(t)}>
            {t.title[locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
