"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Crown, GripVertical, MessageSquareText, X } from "lucide-react";
import { format, useMessages } from "@/lib/i18n";
import type { Pose, SequenceItem } from "@/lib/types";
import { BreathPill, DurationPill, SidePill } from "./ItemPills";
import { PoseThumb } from "./PoseThumb";

const M = {
  fr: { deleted: "Posture supprimée", move: "Déplacer {name}", select: "Sélectionner {name}", remove: "Retirer {name}", peak: "Posture pic" },
  en: { deleted: "Deleted pose", move: "Move {name}", select: "Select {name}", remove: "Remove {name}", peak: "Peak pose" },
  es: { deleted: "Postura eliminada", move: "Mover {name}", select: "Seleccionar {name}", remove: "Quitar {name}", peak: "Postura cumbre" },
};

export interface FlowItemProps {
  item: SequenceItem;
  pose: Pose | undefined;
  index: number;
  checked: boolean;
  expanded: boolean;
  highlighted: boolean;
  isPeak: boolean;
  showSanskrit: boolean;
  onCheck: (shift: boolean) => void;
  onToggleExpand: () => void;
  onChange: (patch: Partial<SequenceItem>) => void;
  onRemove: () => void;
  editor?: React.ReactNode;
}

function Checkbox({ checked, onCheck, label }: { checked: boolean; onCheck: (shift: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onCheck(e.shiftKey);
      }}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
        checked ? "border-accent bg-accent text-surface" : "border-line bg-surface hover:border-accent"
      }`}
    >
      {checked && <Check size={13} strokeWidth={3} />}
    </button>
  );
}

/** Row of the list view. */
export function FlowRow(p: FlowItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: p.item.id });
  const m = useMessages(M);
  const name = p.pose?.name ?? m.deleted;
  return (
    <li
      ref={setNodeRef}
      data-item={p.item.id}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`group relative rounded-2xl transition ${isDragging ? "z-20 bg-surface opacity-80 shadow-lift" : ""} ${
        p.checked ? "bg-accent-soft/60" : p.highlighted ? "bg-lilac-soft" : "hover:bg-surface-2/60"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-2 py-2 sm:flex-nowrap">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={format(m.move, { name })}
          className="hidden cursor-grab touch-none text-muted/50 group-hover:text-muted active:cursor-grabbing sm:block"
        >
          <GripVertical size={16} />
        </button>
        <span className="w-5 text-right text-xs font-semibold text-muted tabular-nums">{p.index}</span>
        <Checkbox checked={p.checked} onCheck={p.onCheck} label={format(m.select, { name })} />
        <button type="button" onClick={p.onToggleExpand} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="relative">
            {p.pose ? <PoseThumb pose={p.pose} size={46} className="rounded-xl" /> : <span className="block h-[46px] w-[46px] rounded-xl bg-line" />}
            {p.isPeak && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-surface shadow" title={m.peak}>
                <Crown size={11} />
              </span>
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{name}</span>
            {(p.showSanskrit && p.pose?.sanskrit) || p.item.cue ? (
              <span className="flex items-center gap-1 truncate text-xs text-muted">
                {p.item.cue ? (
                  <>
                    <MessageSquareText size={12} className="shrink-0" /> <span className="truncate">{p.item.cue.split("\n")[0]}</span>
                  </>
                ) : (
                  <span className="italic">{p.pose?.sanskrit}</span>
                )}
              </span>
            ) : null}
          </span>
        </button>
        <div className="ml-[3.25rem] flex items-center gap-1.5 sm:ml-0">
          <DurationPill value={p.item} onChange={(h) => p.onChange(h)} />
          <SidePill value={p.item.side} onChange={(side) => p.onChange({ side })} />
          <BreathPill value={p.item.breath ?? "aucun"} onChange={(breath) => p.onChange({ breath })} align="end" />
          <button
            type="button"
            onClick={p.onRemove}
            aria-label={format(m.remove, { name })}
            className="icon-btn h-8 w-8 opacity-100 hover:text-danger sm:opacity-0 sm:group-hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      {p.expanded && p.editor && <div className="px-2 pb-2 sm:pl-[5.75rem]">{p.editor}</div>}
    </li>
  );
}

/** Card of the card view. */
export function FlowCard(p: FlowItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.item.id });
  const m = useMessages(M);
  const name = p.pose?.name ?? m.deleted;
  return (
    <li
      ref={setNodeRef}
      data-item={p.item.id}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`group relative ${isDragging ? "z-20 opacity-80" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className={`flex h-full cursor-grab touch-manipulation flex-col items-center rounded-2xl border bg-surface p-2 pb-2.5 text-center transition active:cursor-grabbing ${
          p.checked
            ? "border-accent ring-2 ring-accent/30"
            : p.highlighted
              ? "border-lilac ring-2 ring-lilac/30"
              : "border-line hover:border-accent/50 hover:shadow-soft"
        }`}
      >
        <span className="absolute top-2 left-2 z-[1] flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-surface">
          {p.index}
        </span>
        <span className="absolute top-2 right-2 z-[1]">
          <Checkbox checked={p.checked} onCheck={p.onCheck} label={format(m.select, { name })} />
        </span>
        {p.isPeak && (
          <span className="absolute top-9 left-2 z-[1] flex h-6 w-6 items-center justify-center rounded-full bg-gold text-surface" title={m.peak}>
            <Crown size={12} />
          </span>
        )}
        <button type="button" className="w-full" onClick={p.onToggleExpand} aria-label={name}>
          {p.pose ? <PoseThumb pose={p.pose} className="rounded-xl" /> : <div className="aspect-square w-full rounded-xl bg-line" />}
          <span className="mt-1.5 line-clamp-2 block min-h-[2.5em] text-[13px] leading-tight font-semibold">{name}</span>
          {p.showSanskrit && <span className="block truncate text-[11px] text-muted italic">{p.pose?.sanskrit}</span>}
        </button>
        <div className="mt-1.5 flex flex-col items-center gap-1" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <DurationPill value={p.item} onChange={(h) => p.onChange(h)} />
          <div className="flex gap-1">
            <SidePill value={p.item.side} onChange={(side) => p.onChange({ side })} />
            <BreathPill value={p.item.breath ?? "aucun"} onChange={(breath) => p.onChange({ breath })} />
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={p.onRemove}
        aria-label={format(m.remove, { name })}
        className="absolute -top-2 -right-2 z-[2] hidden h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-danger shadow-soft group-hover:flex"
      >
        <X size={14} />
      </button>
    </li>
  );
}
