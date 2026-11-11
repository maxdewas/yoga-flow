"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { FIREBASE_CONFIG, firebaseConfigured } from "./firebase-config";

let services: { auth: Auth; db: Firestore } | null = null;

/** Firebase services, created once. Only imported lazily (see sync.ts) so the SDK stays out of the first load. */
export function firebase(): { auth: Auth; db: Firestore } {
  if (!firebaseConfigured) throw new Error("Firebase n'est pas configuré.");
  if (services) return services;
  const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  services = {
    auth: getAuth(app),
    // The persistent cache keeps writes made offline and replays them once the connection returns.
    db: initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }),
  };
  return services;
}
