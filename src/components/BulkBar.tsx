"use client";

import { BookmarkPlus, ClipboardPaste, Copy, CopyPlus, Scissors, Trash2, X } from "lucide-react";
import type { Breath, HoldUnit, Side } from "@/lib/types";
import { BreathPill, DurationPill, SidePill } from "./ItemPills";

interface Props {
  count: number;
  canPaste: boolean;
  onClear: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onSave: () => void;
  onDelete: () => void;
  onHold: (h: { hold: number; unit: HoldUnit }) => void;
  onSide: (s: Side) => void;
  onBreath: (b: Breath) => void;
}

function Action({ icon, label, onClick, disabled, danger }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition hover:bg-surface-2 disabled:opacity-40 ${
        danger ? "text-danger" : ""
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

/** Actions sur les postures cochées. */
export function BulkBar(p: Props) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-3">
      <div className="flex max-w-full animate-rise items-center gap-1 rounded-full border border-line bg-surface p-1.5 shadow-lift">
        <button className="icon-btn h-8 w-8" onClick={p.onClear} aria-label="Tout désélectionner">
          <X size={16} />
        </button>
        <span className="shrink-0 pr-1 text-xs font-bold whitespace-nowrap">
          {p.count} <span className="hidden sm:inline">sélectionnée{p.count > 1 ? "s" : ""}</span>
        </span>
        <div className="scrollbar-none flex items-center gap-0.5 overflow-x-auto">
          <Action icon={<Scissors size={15} />} label="Couper" onClick={p.onCut} />
          <Action icon={<Copy size={15} />} label="Copier" onClick={p.onCopy} />
          <Action icon={<ClipboardPaste size={15} />} label="Coller" onClick={p.onPaste} disabled={!p.canPaste} />
          <Action icon={<CopyPlus size={15} />} label="Dupliquer" onClick={p.onDuplicate} />
          <Action icon={<BookmarkPlus size={15} />} label="Enregistrer" onClick={p.onSave} />
        </div>
        <span className="mx-0.5 h-5 w-px shrink-0 bg-line" />
        <div className="flex shrink-0 items-center gap-1">
          <DurationPill onChange={p.onHold} />
          <SidePill onChange={p.onSide} />
          <BreathPill onChange={p.onBreath} align="end" />
        </div>
        <Action icon={<Trash2 size={15} />} label="Supprimer" onClick={p.onDelete} danger />
      </div>
    </div>
  );
}
