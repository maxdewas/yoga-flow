"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  /** Renders the trigger; call `toggle` from its onClick. */
  trigger: (state: { open: boolean; toggle: (e: React.MouseEvent<HTMLElement>) => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
}

/** Small anchored panel: closes on outside click or Escape, opens upward near the bottom of the screen. */
export function Popover({ trigger, children, align = "start", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setUp(rect.bottom > window.innerHeight - 300);
    setOpen((v) => !v);
  };

  const pos =
    align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  return (
    <div ref={ref} className="relative inline-flex">
      {trigger({ open, toggle })}
      {open && (
        <div
          role="dialog"
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-50 ${up ? "bottom-full mb-2" : "top-full mt-2"} ${pos} animate-pop rounded-2xl border border-line bg-surface p-1.5 shadow-lift ${className}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  icon,
  children,
  onClick,
  active,
  danger,
  hint,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
        active ? "bg-accent text-surface" : danger ? "text-danger hover:bg-clay-soft" : "hover:bg-surface-2"
      }`}
    >
      {icon && <span className="flex w-4 justify-center opacity-80">{icon}</span>}
      <span className="flex-1">{children}</span>
      {hint && <span className={`text-xs ${active ? "opacity-80" : "text-muted"}`}>{hint}</span>}
    </button>
  );
}
