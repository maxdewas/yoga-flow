"use client";

import { del, get, keys, set } from "idb-keyval";
import { useEffect, useState } from "react";

// Photos are stored in IndexedDB: localStorage is too small for images.
const PREFIX = "pose-img:";
const key = (poseId: string) => `${PREFIX}${poseId}`;
const listeners = new Set<(poseId: string) => void>();
const notify = (poseId: string) => listeners.forEach((l) => l(poseId));

/** Receives the teacher's own photo changes (null = removed) so the cloud sync can upload them. */
type ImageSink = (poseId: string, blob: Blob | null) => void;
let sink: ImageSink | null = null;
export function setImageSink(next: ImageSink | null) {
  sink = next;
}

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
  const blob = await shrink(file);
  await set(key(poseId), blob);
  notify(poseId);
  sink?.(poseId, blob);
}

export async function deletePoseImage(poseId: string) {
  await del(key(poseId));
  notify(poseId);
  sink?.(poseId, null);
}

/** Stores a photo received from the cloud (null = removed) without sending it back. */
export async function storeSyncedImage(poseId: string, blob: Blob | null) {
  if (blob) await set(key(poseId), blob);
  else await del(key(poseId));
  notify(poseId);
}

export const readPoseImage = (poseId: string) => get<Blob>(key(poseId));

export async function listPoseImageIds(): Promise<string[]> {
  return (await keys())
    .filter((k): k is string => typeof k === "string" && k.startsWith(PREFIX))
    .map((k) => k.slice(PREFIX.length));
}

/** Removes every photo from this device (used on sign-out; the cloud copy is kept). */
export async function clearPoseImages() {
  const ids = await listPoseImageIds();
  await Promise.all(ids.map((id) => del(key(id))));
  ids.forEach(notify);
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
