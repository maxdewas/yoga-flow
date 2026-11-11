"use client";

import { ArrowDown, ArrowLeftRight, ArrowUp, Circle, Minus, MoveLeft, MoveRight, Plus, Timer, Wind } from "lucide-react";
import type { ReactNode } from "react";
import { formatHoldShort } from "@/lib/duration";
import { BREATH_LABELS, SIDE_SHORT, type Breath, type HoldUnit, type SequenceItem, type Side } from "@/lib/types";
import { MenuItem, Popover } from "./ui/Popover";

const BREATH_PRESETS = [1, 3, 5, 8, 10, 15];
const SECOND_PRESETS = [15, 30, 45, 60, 90, 120, 180, 300];

export const SIDE_ICONS: Record<Side, ReactNode> = {
  aucun: <Circle size={13} />,
  droite: <MoveRight size={14} />,
  gauche: <MoveLeft size={14} />,
  "les-deux": <ArrowLeftRight size={14} />,
};

export const BREATH_ICONS: Record<Breath, ReactNode> = {
  aucun: <Minus size={14} />,
  inspire: <ArrowUp size={14} />,
  expire: <ArrowDown size={14} />,
  respire: <Wind size={14} />,
};

type Hold = Pick<SequenceItem, "hold" | "unit">;

/** Durée : unité, valeurs rapides et réglage fin. `value` absent = plusieurs postures sélectionnées. */
export function DurationPill({ value, onChange, align }: { value?: Hold; onChange: (h: Hold) => void; align?: "start" | "end" | "center" }) {
  return (
    <Popover
      align={align ?? "center"}
      className="w-64"
      trigger={({ open, toggle }) => (
        <button type="button" className="pill" data-open={open} onClick={toggle} aria-label={value ? `Durée : ${formatHoldShort(value as SequenceItem)}` : "Durée"}>
          <Timer size={13} className="opacity-60" />
          {value ? formatHoldShort(value as SequenceItem) : "Durée"}
        </button>
      )}
    >
      {() => <DurationEditor value={value} onChange={onChange} />}
    </Popover>
  );
}

function DurationEditor({ value, onChange }: { value?: Hold; onChange: (h: Hold) => void }) {
  const unit: HoldUnit = value?.unit ?? "respirations";
  const presets = unit === "respirations" ? BREATH_PRESETS : SECOND_PRESETS;
  const step = unit === "respirations" ? 1 : 5;
  const hold = value?.hold ?? (unit === "respirations" ? 5 : 30);
  const set = (h: number) => onChange({ unit, hold: Math.max(1, Math.min(3600, Math.round(h))) });
  return (
    <div className="space-y-2 p-1.5">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-2 p-1 text-xs font-semibold">
        {(["respirations", "secondes"] as HoldUnit[]).map((u) => (
          <button
            key={u}
            type="button"
            className={`rounded-full py-1.5 transition ${unit === u ? "bg-surface shadow-soft" : "text-muted"}`}
            onClick={() => onChange({ unit: u, hold: u === "respirations" ? 5 : 30 })}
          >
            {u === "respirations" ? "Respirations" : "Secondes"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => set(p)}
            className={`rounded-xl py-1.5 text-sm font-semibold transition ${
              value && value.unit === unit && value.hold === p ? "bg-accent text-surface" : "hover:bg-surface-2"
            }`}
          >
            {unit === "respirations" ? p : p < 60 ? `${p}s` : `${Math.floor(p / 60)}′${p % 60 ? String(p % 60) : ""}`}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" className="icon-btn bg-surface-2" aria-label="Moins" onClick={() => set(hold - step)}>
          <Minus size={16} />
        </button>
        <label className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-line px-2 py-1.5 focus-within:border-accent">
          <input
            type="number"
            min={1}
            value={hold}
            onChange={(e) => set(Number(e.target.value) || 1)}
            className="w-14 bg-transparent text-center text-base font-bold outline-none"
            aria-label="Valeur"
          />
          <span className="text-xs text-muted">{unit === "respirations" ? "resp." : "s"}</span>
        </label>
        <button type="button" className="icon-btn bg-surface-2" aria-label="Plus" onClick={() => set(hold + step)}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export function SidePill({ value, onChange, align }: { value?: Side; onChange: (s: Side) => void; align?: "start" | "end" | "center" }) {
  return (
    <Popover
      align={align ?? "center"}
      className="w-48"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          className={`pill ${value && value !== "aucun" ? "text-lilac" : ""}`}
          data-open={open}
          onClick={toggle}
          aria-label={value ? `Côté : ${SIDE_SHORT[value]}` : "Côté"}
        >
          {value ? SIDE_ICONS[value] : <ArrowLeftRight size={13} />}
          {value ? SIDE_SHORT[value] : "Côté"}
        </button>
      )}
    >
      {(close) =>
        (["aucun", "droite", "gauche", "les-deux"] as Side[]).map((s) => (
          <MenuItem
            key={s}
            icon={SIDE_ICONS[s]}
            active={s === value}
            onClick={() => {
              onChange(s);
              close();
            }}
          >
            {{ aucun: "Face / sans côté", droite: "Côté droit", gauche: "Côté gauche", "les-deux": "Droite puis gauche" }[s]}
          </MenuItem>
        ))
      }
    </Popover>
  );
}

export function BreathPill({ value, onChange, align }: { value?: Breath; onChange: (b: Breath) => void; align?: "start" | "end" | "center" }) {
  const v = value ?? undefined;
  return (
    <Popover
      align={align ?? "center"}
      className="w-48"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          className={`pill ${v === "inspire" ? "text-accent" : v === "expire" ? "text-clay" : v === "respire" ? "text-lilac" : "text-muted"}`}
          data-open={open}
          onClick={toggle}
          aria-label={v ? `Souffle : ${BREATH_LABELS[v]}` : "Souffle"}
        >
          {v ? BREATH_ICONS[v] : <Wind size={13} />}
          {v ? (v === "aucun" ? "Souffle" : BREATH_LABELS[v]) : "Souffle"}
        </button>
      )}
    >
      {(close) =>
        (["aucun", "inspire", "expire", "respire"] as Breath[]).map((b) => (
          <MenuItem
            key={b}
            icon={BREATH_ICONS[b]}
            active={b === v}
            onClick={() => {
              onChange(b);
              close();
            }}
          >
            {BREATH_LABELS[b]}
          </MenuItem>
        ))
      }
    </Popover>
  );
}
