"use client";

import { ArrowDown, ArrowLeftRight, ArrowUp, Circle, Minus, MoveLeft, MoveRight, Plus, Timer, Wind } from "lucide-react";
import type { ReactNode } from "react";
import { formatHoldShort } from "@/lib/duration";
import { format, useLabels, useLocale, useMessages } from "@/lib/i18n";
import type { Breath, HoldUnit, SequenceItem, Side } from "@/lib/types";
import { MenuItem, Popover } from "./ui/Popover";

const M = {
  fr: {
    duration: "Durée", durationOf: "Durée : {value}", breaths: "Respirations", seconds: "Secondes", less: "Moins", more: "Plus",
    value: "Valeur", breathsShort: "resp.", side: "Côté", sideOf: "Côté : {value}", breath: "Souffle", breathOf: "Souffle : {value}",
    sides: { aucun: "Face / sans côté", droite: "Côté droit", gauche: "Côté gauche", "les-deux": "Droite puis gauche" } as Record<Side, string>,
  },
  en: {
    duration: "Duration", durationOf: "Duration: {value}", breaths: "Breaths", seconds: "Seconds", less: "Less", more: "More",
    value: "Value", breathsShort: "breaths", side: "Side", sideOf: "Side: {value}", breath: "Breath", breathOf: "Breath: {value}",
    sides: { aucun: "Front / no side", droite: "Right side", gauche: "Left side", "les-deux": "Right then left" } as Record<Side, string>,
  },
  es: {
    duration: "Duración", durationOf: "Duración: {value}", breaths: "Respiraciones", seconds: "Segundos", less: "Menos", more: "Más",
    value: "Valor", breathsShort: "resp.", side: "Lado", sideOf: "Lado: {value}", breath: "Respiración", breathOf: "Respiración: {value}",
    sides: { aucun: "Frente / sin lado", droite: "Lado derecho", gauche: "Lado izquierdo", "les-deux": "Derecha y luego izquierda" } as Record<Side, string>,
  },
};

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

/** Duration: unit, quick values and fine tuning. No `value` = several poses selected. */
export function DurationPill({ value, onChange, align }: { value?: Hold; onChange: (h: Hold) => void; align?: "start" | "end" | "center" }) {
  const m = useMessages(M);
  const locale = useLocale();
  return (
    <Popover
      align={align ?? "center"}
      className="w-64"
      trigger={({ open, toggle }) => (
        <button type="button" className="pill" data-open={open} onClick={toggle} aria-label={value ? format(m.durationOf, { value: formatHoldShort(value as SequenceItem, locale) }) : m.duration}>
          <Timer size={13} className="opacity-60" />
          {value ? formatHoldShort(value as SequenceItem, locale) : m.duration}
        </button>
      )}
    >
      {() => <DurationEditor value={value} onChange={onChange} />}
    </Popover>
  );
}

function DurationEditor({ value, onChange }: { value?: Hold; onChange: (h: Hold) => void }) {
  const m = useMessages(M);
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
            {u === "respirations" ? m.breaths : m.seconds}
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
        <button type="button" className="icon-btn bg-surface-2" aria-label={m.less} onClick={() => set(hold - step)}>
          <Minus size={16} />
        </button>
        <label className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-line px-2 py-1.5 focus-within:border-accent">
          <input
            type="number"
            min={1}
            value={hold}
            onChange={(e) => set(Number(e.target.value) || 1)}
            className="w-14 bg-transparent text-center text-base font-bold outline-none"
            aria-label={m.value}
          />
          <span className="text-xs text-muted">{unit === "respirations" ? m.breathsShort : "s"}</span>
        </label>
        <button type="button" className="icon-btn bg-surface-2" aria-label={m.more} onClick={() => set(hold + step)}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export function SidePill({ value, onChange, align }: { value?: Side; onChange: (s: Side) => void; align?: "start" | "end" | "center" }) {
  const m = useMessages(M);
  const L = useLabels();
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
          aria-label={value ? format(m.sideOf, { value: L.sideShort[value] }) : m.side}
        >
          {value ? SIDE_ICONS[value] : <ArrowLeftRight size={13} />}
          {value ? L.sideShort[value] : m.side}
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
            {m.sides[s]}
          </MenuItem>
        ))
      }
    </Popover>
  );
}

export function BreathPill({ value, onChange, align }: { value?: Breath; onChange: (b: Breath) => void; align?: "start" | "end" | "center" }) {
  const m = useMessages(M);
  const L = useLabels();
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
          aria-label={v ? format(m.breathOf, { value: L.breath[v] }) : m.breath}
        >
          {v ? BREATH_ICONS[v] : <Wind size={13} />}
          {v ? (v === "aucun" ? m.breath : L.breath[v]) : m.breath}
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
            {L.breath[b]}
          </MenuItem>
        ))
      }
    </Popover>
  );
}
