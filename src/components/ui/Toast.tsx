"use client";

import { useCallback, useRef, useState } from "react";

export interface ToastData {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
}

export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const seq = useRef(0);
  const show = useCallback((text: string, action?: ToastData["action"]) => {
    const id = ++seq.current;
    setToast({ id, text, action });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3200);
  }, []);
  return { toast, show, hide: () => setToast(null) };
}

export function Toast({ toast, onHide, raised }: { toast: ToastData | null; onHide: () => void; raised?: boolean }) {
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      role="status"
      className={`fixed left-1/2 z-[60] flex -translate-x-1/2 animate-rise items-center gap-3 rounded-full bg-foreground py-2 pr-2 pl-4 text-sm text-background shadow-lift ${
        raised ? "bottom-24" : "bottom-6"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
      <span className="max-w-[60vw] truncate">{toast.text}</span>
      {toast.action ? (
        <button
          className="rounded-full bg-background/15 px-3 py-1 font-semibold hover:bg-background/25"
          onClick={() => {
            toast.action?.run();
            onHide();
          }}
        >
          {toast.action.label}
        </button>
      ) : (
        <span className="w-2" />
      )}
    </div>
  );
}
