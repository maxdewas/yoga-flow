"use client";

// Cloud sync of the teacher's data with Firestore, one account per Google user.
// Each synced entity is a document users/{uid}/{collection}/{id} holding its JSON.
// Loaded lazily by sync.ts; the UI talks to sync.ts only.

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as authSignOut,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocsFromServer,
  onSnapshot,
  setDoc,
  writeBatch,
  type Firestore,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { firebase } from "./firebase";
import { clearPoseImages, listPoseImageIds, readPoseImage, setImageSink, storeSyncedImage } from "./images";
import { useStore } from "./store";
import { setSyncStatus, type SyncError, type SyncUser } from "./sync";
import type { ClassPlan } from "./types";

type AppState = ReturnType<typeof useStore.getState>;
type Entities = Record<string, unknown>;

/** Store slices mirrored in the cloud. Display prefs stay per device. */
const KEYS = ["plans", "customPoses", "sequences", "poseNotes", "poseEdits"] as const;
type Key = (typeof KEYS)[number];
const IMAGES = "images";

/** Account this device's local data belongs to; absent = never merged with the cloud. */
const LINK_KEY = "flow-creator-sync-uid";
/** Revision of each photo held locally, so unchanged photos are not downloaded again. */
const REVS_KEY = "flow-creator-sync-image-revs";
/** Firestore caps a document at 1 MiB. */
const MAX_IMAGE_CHARS = 1_000_000;
/** Groups keystrokes into one write. */
const FLUSH_DELAY = 800;
const DELETED = Symbol("deleted");

interface Pending {
  key: Key;
  id: string;
  value: unknown;
}

interface Session {
  firebaseUser: User;
  user: SyncUser;
  db: Firestore;
  unsubs: Unsubscribe[];
  /** Local changes not yet handed to Firestore, by `${key}/${id}`. */
  pending: Map<string, Pending>;
  timer?: ReturnType<typeof setTimeout>;
  inflight: number;
  /** Listeners that received a snapshot from the server. */
  serverSeen: Set<string>;
  imageQueue: Promise<void>;
  linkFailed: boolean;
  error?: SyncError;
}

let session: Session | null = null;
/** True while remote data is written into the store, so it is not sent back. */
let applyingRemote = false;

const uid = (s: Session) => s.firebaseUser.uid;
const col = (s: Session, name: string) => collection(s.db, "users", uid(s), name);
const ref = (s: Session, name: string, id: string) => doc(s.db, "users", uid(s), name, encodeURIComponent(id));

function entities(state: AppState, key: Key): Entities {
  const slice = state[key];
  return Array.isArray(slice)
    ? Object.fromEntries((slice as { id: string }[]).map((e) => [e.id, e]))
    : (slice as Entities);
}

/** Rebuilds a slice: arrays keep their current order for known ids, new ids come first (lists are newest first). */
function toSlice(key: Key, rec: Entities, current: AppState[Key]): AppState[Key] {
  if (!Array.isArray(current)) return rec as AppState[Key];
  const known = (current as { id: string }[]).map((e) => e.id).filter((id) => id in rec);
  const knownSet = new Set(known);
  const added = Object.keys(rec).filter((id) => !knownSet.has(id));
  return [...added, ...known].map((id) => rec[id]) as AppState[Key];
}

function parseDocs(snap: QuerySnapshot): Entities {
  const out: Entities = {};
  for (const d of snap.docs) {
    const { id, json } = d.data() as { id?: unknown; json?: unknown };
    if (typeof id !== "string" || typeof json !== "string") {
      console.warn(`Document ignoré (format inattendu) : ${d.ref.path}`);
      continue;
    }
    try {
      out[id] = JSON.parse(json);
    } catch {
      console.warn(`Document ignoré (JSON invalide) : ${d.ref.path}`);
    }
  }
  return out;
}

function setStore(patch: Record<string, unknown>) {
  applyingRemote = true;
  try {
    useStore.setState(patch as Partial<AppState>);
  } finally {
    applyingRemote = false;
  }
}

function readRevs(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(REVS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeRev(poseId: string, rev: string | null) {
  const revs = readRevs();
  if (rev) revs[poseId] = rev;
  else delete revs[poseId];
  localStorage.setItem(REVS_KEY, JSON.stringify(revs));
}

// ---------- Status ----------

function refresh() {
  const s = session;
  if (!s) return;
  const { user } = s;
  if (s.error) setSyncStatus({ state: "error", user, error: s.error });
  else if (!navigator.onLine) setSyncStatus({ state: "offline", user });
  else if (s.pending.size || s.inflight || s.serverSeen.size < KEYS.length + 1) setSyncStatus({ state: "syncing", user });
  else setSyncStatus({ state: "synced", user });
}

function describe(err: unknown): SyncError {
  const code = (err as { code?: string })?.code;
  if (code === "permission-denied") return "permission-denied";
  if (code === "unavailable") return "unavailable";
  return "sync-failed";
}

function fail(s: Session, err: unknown, error = describe(err)) {
  console.error(err);
  if (session !== s) return;
  s.error = error;
  refresh();
}

/** Counts a write until the server acknowledges it (stays pending while offline). */
function track(s: Session, write: Promise<unknown>) {
  s.inflight++;
  refresh();
  write
    .then(
      () => {
        if (session === s && s.error && !s.linkFailed) s.error = undefined;
      },
      (err) => fail(s, err),
    )
    .finally(() => {
      s.inflight--;
      refresh();
    });
}

// ---------- Local → cloud ----------

function onLocalChange(state: AppState, before: AppState) {
  const s = session;
  if (!s || applyingRemote) return;
  let changed = false;
  for (const key of KEYS) {
    if (state[key] === before[key]) continue;
    const a = entities(before, key);
    const b = entities(state, key);
    for (const id of Object.keys(b)) {
      if (a[id] !== b[id]) {
        s.pending.set(`${key}/${id}`, { key, id, value: b[id] });
        changed = true;
      }
    }
    for (const id of Object.keys(a)) {
      if (!(id in b)) {
        s.pending.set(`${key}/${id}`, { key, id, value: DELETED });
        changed = true;
      }
    }
  }
  if (!changed) return;
  clearTimeout(s.timer);
  s.timer = setTimeout(flush, FLUSH_DELAY);
  refresh();
}

/** Hands pending changes to Firestore, which queues them locally until the server accepts them. */
function flush() {
  const s = session;
  if (!s || !s.pending.size) return;
  clearTimeout(s.timer);
  const items = [...s.pending.values()];
  s.pending.clear();
  // A batch holds at most 500 writes.
  for (let i = 0; i < items.length; i += 400) {
    const batch = writeBatch(s.db);
    for (const { key, id, value } of items.slice(i, i + 400)) {
      const r = ref(s, key, id);
      if (value === DELETED) batch.delete(r);
      else batch.set(r, { id, json: JSON.stringify(value) });
    }
    track(s, batch.commit());
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Resolves once the write is queued in Firestore (not when the server confirms it). */
async function uploadImage(s: Session, poseId: string, blob: Blob | null) {
  if (session !== s) return;
  if (!blob) {
    writeRev(poseId, null);
    track(s, deleteDoc(ref(s, IMAGES, poseId)));
    return;
  }
  const data = await blobToDataUrl(blob);
  if (session !== s) return;
  if (data.length > MAX_IMAGE_CHARS) {
    fail(s, new Error(`Photo ${poseId} : ${data.length} caractères`), "photo-too-large");
    return;
  }
  const rev = crypto.randomUUID();
  writeRev(poseId, rev);
  track(s, setDoc(ref(s, IMAGES, poseId), { id: poseId, data, rev }));
}

// ---------- Cloud → local ----------

function applyRemote(s: Session, key: Key, snap: QuerySnapshot) {
  if (session !== s) return;
  const remote = parseDocs(snap);
  // Changes typed during the flush delay are newer than anything in the snapshot.
  for (const p of s.pending.values()) {
    if (p.key !== key) continue;
    if (p.value === DELETED) delete remote[p.id];
    else remote[p.id] = p.value;
  }
  const state = useStore.getState();
  const local = entities(state, key);
  let same = Object.keys(local).length === Object.keys(remote).length;
  for (const id of Object.keys(remote)) {
    // Keep the local object when nothing changed, so React does not re-render it.
    if (id in local && (local[id] === remote[id] || JSON.stringify(local[id]) === JSON.stringify(remote[id]))) {
      remote[id] = local[id];
    } else {
      same = false;
    }
  }
  if (!same) setStore({ [key]: toSlice(key, remote, state[key]) });
}

async function applyRemoteImages(s: Session, snap: QuerySnapshot, first: boolean) {
  const revs = readRevs();
  for (const change of snap.docChanges()) {
    // Our own uploads: the photo is already on this device.
    if (change.doc.metadata.hasPendingWrites) continue;
    const { id, data, rev } = change.doc.data() as { id?: unknown; data?: unknown; rev?: unknown };
    if (typeof id !== "string") continue;
    if (change.type === "removed") {
      await storeSyncedImage(id, null);
      writeRev(id, null);
    } else if (typeof data === "string" && typeof rev === "string" && revs[id] !== rev) {
      await storeSyncedImage(id, await (await fetch(data)).blob());
      writeRev(id, rev);
    }
    if (session !== s) return;
  }
  if (!first) return;
  // Photos deleted on another device while this one was closed.
  const remoteIds = new Set(snap.docs.map((d) => (d.data() as { id?: unknown }).id));
  for (const id of await listPoseImageIds()) {
    if (!remoteIds.has(id)) {
      await storeSyncedImage(id, null);
      writeRev(id, null);
    }
  }
}

// ---------- Session ----------

/**
 * First sign-in on this device: union of local and cloud data. The cloud wins on conflicts,
 * except a class plan edited more recently here. Local-only entries are uploaded.
 */
async function firstLink(s: Session) {
  const remotes = await Promise.all(KEYS.map(async (key) => parseDocs(await getDocsFromServer(col(s, key)))));
  const remoteImages = await getDocsFromServer(col(s, IMAGES));
  if (session !== s) return;

  const state = useStore.getState();
  const merged: Record<string, unknown> = {};
  KEYS.forEach((key, i) => {
    const remote = remotes[i];
    const local = entities(state, key);
    const out: Entities = { ...remote };
    for (const id of Object.keys(local)) {
      const newer =
        key === "plans" && id in remote && (local[id] as ClassPlan).updatedAt > (remote[id] as ClassPlan).updatedAt;
      if (!(id in remote) || newer) {
        out[id] = local[id];
        s.pending.set(`${key}/${id}`, { key, id, value: local[id] });
      }
    }
    merged[key] = toSlice(key, out, state[key]);
  });
  setStore(merged);
  flush();

  const remoteImageIds = new Set(remoteImages.docs.map((d) => (d.data() as { id?: unknown }).id));
  for (const id of await listPoseImageIds()) {
    if (remoteImageIds.has(id)) continue;
    const blob = await readPoseImage(id);
    if (blob) await uploadImage(s, id, blob);
  }
}

function listen(s: Session) {
  const seen = (name: string, fromCache: boolean) => {
    if (fromCache || s.serverSeen.has(name)) return;
    s.serverSeen.add(name);
    refresh();
  };
  for (const key of KEYS) {
    s.unsubs.push(
      onSnapshot(
        col(s, key),
        (snap) => {
          applyRemote(s, key, snap);
          seen(key, snap.metadata.fromCache);
        },
        (err) => fail(s, err),
      ),
    );
  }
  let first = true;
  s.unsubs.push(
    onSnapshot(
      col(s, IMAGES),
      (snap) => {
        const isFirst = first;
        first = false;
        s.imageQueue = s.imageQueue
          .then(() => applyRemoteImages(s, snap, isFirst))
          .then(() => seen(IMAGES, snap.metadata.fromCache))
          .catch((err) => fail(s, err));
      },
      (err) => fail(s, err),
    ),
  );
}

async function begin(s: Session) {
  await waitHydrated();
  if (session !== s) return;
  refresh();
  if (localStorage.getItem(LINK_KEY) !== uid(s)) {
    try {
      await firstLink(s);
    } catch (err) {
      s.linkFailed = true;
      fail(s, err, "first-sync-offline");
      return;
    }
    if (session !== s) return;
    localStorage.setItem(LINK_KEY, uid(s));
  }
  s.unsubs.push(useStore.subscribe(onLocalChange));
  setImageSink((id, blob) => void uploadImage(s, id, blob).catch((err) => fail(s, err)));
  listen(s);
}

function open(user: User): Session {
  stop();
  const s: Session = {
    firebaseUser: user,
    user: { uid: user.uid, name: user.displayName, email: user.email, photoURL: user.photoURL },
    db: firebase().db,
    unsubs: [],
    pending: new Map(),
    inflight: 0,
    serverSeen: new Set(),
    imageQueue: Promise.resolve(),
    linkFailed: false,
  };
  session = s;
  void begin(s);
  return s;
}

function stop() {
  const s = session;
  if (!s) return;
  flush();
  s.unsubs.forEach((u) => u());
  setImageSink(null);
  session = null;
}

function waitHydrated(): Promise<void> {
  if (useStore.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = useStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

// ---------- Public API (via sync.ts) ----------

let started = false;

export function start() {
  if (started) return;
  started = true;
  onAuthStateChanged(firebase().auth, (user) => {
    if (user) {
      if (session?.firebaseUser.uid !== user.uid) open(user);
    } else {
      stop();
      setSyncStatus({ state: "signed-out" });
    }
  });
  // Send what was typed during the flush delay before the tab goes away.
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("offline", refresh);
  window.addEventListener("online", () => {
    if (session?.linkFailed) open(session.firebaseUser);
    else refresh();
  });
}

export async function signIn() {
  try {
    await signInWithPopup(firebase().auth, new GoogleAuthProvider());
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
    console.error(err);
    setSyncStatus({
      state: "signed-out",
      error:
        code === "auth/unauthorized-domain"
          ? "unauthorized-domain"
          : code === "auth/popup-blocked"
            ? "popup-blocked"
            : "sign-in-failed",
    });
  }
}

/** Signs out and empties this device; the data stays in the Google account. */
export async function signOut() {
  stop();
  await authSignOut(firebase().auth);
  localStorage.removeItem(LINK_KEY);
  localStorage.removeItem(REVS_KEY);
  setStore({ plans: [], customPoses: [], poseNotes: {}, poseEdits: {}, sequences: [] });
  await clearPoseImages();
}
