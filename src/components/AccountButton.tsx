"use client";

import { CloudAlert, CloudCheck, CloudOff, LogIn, LogOut, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { signIn, signOut, startSync, useSync, type SyncStatus } from "@/lib/sync";
import { MenuItem, Popover } from "./ui/Popover";

const LABELS: Record<"syncing" | "synced" | "offline" | "error", string> = {
  syncing: "Synchronisation…",
  synced: "Tout est enregistré dans ton compte",
  offline: "Hors ligne : les changements partiront au retour du réseau",
  error: "Erreur de synchronisation",
};

function StatusIcon({ status }: { status: SyncStatus }) {
  const cls = "h-3.5 w-3.5";
  switch (status.state) {
    case "synced":
      return <CloudCheck className={`${cls} text-accent`} />;
    case "syncing":
      return <RefreshCw className={`${cls} animate-spin text-muted`} />;
    case "offline":
      return <CloudOff className={`${cls} text-muted`} />;
    case "error":
      return <CloudAlert className={`${cls} text-danger`} />;
    default:
      return null;
  }
}

/** Google sign-in that keeps classes, poses and photos in the teacher's account. Hidden when Firebase is not configured. */
export function AccountButton() {
  const status = useSync((s) => s.status);

  // Runs after the first paint, so the Firebase SDK never delays the page.
  useEffect(startSync, []);

  if (status.state === "disabled") return null;
  if (status.state === "loading") return <span className="h-8 w-8" aria-hidden />;

  if (status.state === "signed-out") {
    return (
      <div className="flex items-center gap-2">
        {status.error && (
          <span className="hidden max-w-56 text-xs text-danger sm:inline" role="alert">
            {status.error}
          </span>
        )}
        <button
          type="button"
          onClick={() => signIn()}
          title={status.error ?? "Sauvegarder tes cours dans ton compte Google"}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:text-foreground"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Se connecter</span>
        </button>
      </div>
    );
  }

  const { user } = status;
  const message = status.state === "error" ? status.message : LABELS[status.state];

  const onSignOut = async () => {
    if (
      status.state !== "synced" &&
      !confirm("Certains changements ne sont pas encore envoyés et seront perdus. Se déconnecter quand même ?")
    ) {
      return;
    }
    await signOut();
  };

  return (
    <Popover
      align="end"
      className="w-72"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={`Compte ${user.email ?? ""} — ${message}`}
          title={message}
          className="relative flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold shadow-soft"
        >
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element -- Google avatar, remote and tiny
            <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full" />
          ) : (
            (user.name ?? user.email ?? "?").charAt(0).toUpperCase()
          )}
          <span className="absolute -right-1 -bottom-1 rounded-full bg-surface p-0.5">
            <StatusIcon status={status} />
          </span>
        </button>
      )}
    >
      {(close) => (
        <div role="menu">
          <div className="px-3 py-2">
            {user.name && <p className="text-sm font-semibold">{user.name}</p>}
            {user.email && <p className="text-xs text-muted">{user.email}</p>}
            <p className={`mt-2 flex items-start gap-1.5 text-xs ${status.state === "error" ? "text-danger" : "text-muted"}`}>
              <span className="mt-px">
                <StatusIcon status={status} />
              </span>
              {message}
            </p>
          </div>
          <MenuItem
            icon={<LogOut className="h-4 w-4" />}
            onClick={() => {
              close();
              void onSignOut();
            }}
          >
            Se déconnecter
          </MenuItem>
        </div>
      )}
    </Popover>
  );
}
