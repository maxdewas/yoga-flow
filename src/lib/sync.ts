"use client";

import { create } from "zustand";
import { firebaseConfigured } from "./firebase-config";

export interface SyncUser {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
}

/** Why sync or sign-in failed; the interface words it in the active language. */
export type SyncError =
  | "load-failed"
  | "permission-denied"
  | "unavailable"
  | "sync-failed"
  | "photo-too-large"
  | "first-sync-offline"
  | "unauthorized-domain"
  | "popup-blocked"
  | "sign-in-failed";

export type SyncStatus =
  /** No Firebase config: the app is local-only. */
  | { state: "disabled" }
  | { state: "loading" }
  | { state: "signed-out"; error?: SyncError }
  | { state: "syncing" | "synced" | "offline"; user: SyncUser }
  | { state: "error"; user: SyncUser; error: SyncError };

export const useSync = create<{ status: SyncStatus }>(() => ({
  status: { state: firebaseConfigured ? "loading" : "disabled" },
}));

export const setSyncStatus = (status: SyncStatus) => useSync.setState({ status });

// The Firebase SDK is heavy: load it only once the app has rendered.
let engine: Promise<typeof import("./sync-engine")> | null = null;
const load = () => (engine ??= import("./sync-engine"));

function fail(err: unknown) {
  console.error(err);
  setSyncStatus({ state: "signed-out", error: "load-failed" });
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
