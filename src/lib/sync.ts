"use client";

import { create } from "zustand";
import { firebaseConfigured } from "./firebase-config";

export interface SyncUser {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
}

export type SyncStatus =
  /** No Firebase config: the app is local-only. */
  | { state: "disabled" }
  | { state: "loading" }
  | { state: "signed-out"; error?: string }
  | { state: "syncing" | "synced" | "offline"; user: SyncUser }
  | { state: "error"; user: SyncUser; message: string };

export const useSync = create<{ status: SyncStatus }>(() => ({
  status: { state: firebaseConfigured ? "loading" : "disabled" },
}));

export const setSyncStatus = (status: SyncStatus) => useSync.setState({ status });

// The Firebase SDK is heavy: load it only once the app has rendered.
let engine: Promise<typeof import("./sync-engine")> | null = null;
const load = () => (engine ??= import("./sync-engine"));

function fail(err: unknown) {
  console.error(err);
  setSyncStatus({ state: "signed-out", error: "Impossible de charger la connexion Google." });
}

/** Starts listening to the Google session; safe to call several times. */
export function startSync() {
  if (!firebaseConfigured) return;
  load().then((e) => e.start(), fail);
}

export async function signIn() {
  await (await load()).signIn();
}

export async function signOut() {
  await (await load()).signOut();
}
