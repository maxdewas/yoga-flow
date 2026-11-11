"use client";

import { del, get, set } from "idb-keyval";
import { useEffect, useState } from "react";

// Photos are stored in IndexedDB: localStorage is too small for images.
const key = (poseId: string) => `pose-img:${poseId}`;
const listeners = new Set<(poseId: string) => void>();

const MAX_SIDE = 900;

/** Downscale before storing so a phone photo does not cost several MB per pose. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Conversion impossible"))), "image/webp", 0.85),
  );
}

export async function savePoseImage(poseId: string, file: File) {
  await set(key(poseId), await shrink(file));
  listeners.forEach((l) => l(poseId));
}

export async function deletePoseImage(poseId: string) {
  await del(key(poseId));
  listeners.forEach((l) => l(poseId));
}

export function usePoseImage(poseId: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let current: string | null = null;
    let cancelled = false;
    const load = async () => {
      const blob = await get<Blob>(key(poseId));
      if (cancelled) return;
      if (current) URL.revokeObjectURL(current);
      current = blob ? URL.createObjectURL(blob) : null;
      setUrl(current);
    };
    load();
    const onChange = (id: string) => id === poseId && load();
    listeners.add(onChange);
    return () => {
      cancelled = true;
      listeners.delete(onChange);
      if (current) URL.revokeObjectURL(current);
    };
  }, [poseId]);
  return url;
}
