"use client";

import { CloudAlert, CloudCheck, CloudOff, LogIn, LogOut, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { format, useMessages } from "@/lib/i18n";
import { signIn, signOut, startSync, useSync, type SyncError, type SyncStatus } from "@/lib/sync";
import { MenuItem, Popover } from "./ui/Popover";

const M = {
  fr: {
    state: {
      syncing: "Synchronisation…",
      synced: "Tout est enregistré dans ton compte",
      offline: "Hors ligne : les changements partiront au retour du réseau",
    },
    errors: {
      "load-failed": "Impossible de charger la connexion Google.",
      "permission-denied": "Accès refusé par Firebase : vérifie les règles Firestore.",
      unavailable: "Firebase est injoignable pour le moment.",
      "sync-failed": "La synchronisation a échoué.",
      "photo-too-large": "Une photo est trop lourde pour être synchronisée.",
      "first-sync-offline": "Connexion internet nécessaire pour la première synchronisation.",
      "unauthorized-domain": "Ce site n'est pas autorisé dans Firebase (Authentication → Settings → Authorized domains).",
      "popup-blocked": "La fenêtre de connexion a été bloquée par le navigateur.",
      "sign-in-failed": "Connexion Google impossible.",
    } satisfies Record<SyncError, string>,
    signInTitle: "Sauvegarder tes cours dans ton compte Google",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    confirmSignOut: "Certains changements ne sont pas encore envoyés et seront perdus. Se déconnecter quand même ?",
    account: "Compte {email} — {message}",
  },
  en: {
    state: {
      syncing: "Syncing…",
      synced: "Everything is saved to your account",
      offline: "Offline: changes will be sent once you're back online",
    },
    errors: {
      "load-failed": "Couldn't load Google sign-in.",
      "permission-denied": "Access denied by Firebase: check the Firestore rules.",
      unavailable: "Firebase can't be reached right now.",
      "sync-failed": "Sync failed.",
      "photo-too-large": "A photo is too large to be synced.",
      "first-sync-offline": "An internet connection is needed for the first sync.",
      "unauthorized-domain": "This site isn't authorized in Firebase (Authentication → Settings → Authorized domains).",
      "popup-blocked": "The sign-in window was blocked by the browser.",
      "sign-in-failed": "Google sign-in failed.",
    } satisfies Record<SyncError, string>,
    signInTitle: "Save your classes to your Google account",
    signIn: "Sign in",
    signOut: "Sign out",
    confirmSignOut: "Some changes haven't been sent yet and will be lost. Sign out anyway?",
    account: "Account {email} — {message}",
  },
  es: {
    state: {
      syncing: "Sincronizando…",
      synced: "Todo está guardado en tu cuenta",
      offline: "Sin conexión: los cambios se enviarán cuando vuelva la red",
    },
    errors: {
      "load-failed": "No se pudo cargar el inicio de sesión de Google.",
      "permission-denied": "Firebase denegó el acceso: revisa las reglas de Firestore.",
      unavailable: "Firebase no está disponible en este momento.",
      "sync-failed": "La sincronización ha fallado.",
      "photo-too-large": "Una foto es demasiado pesada para sincronizarse.",
      "first-sync-offline": "Se necesita conexión a internet para la primera sincronización.",
      "unauthorized-domain": "Este sitio no está autorizado en Firebase (Authentication → Settings → Authorized domains).",
      "popup-blocked": "El navegador bloqueó la ventana de inicio de sesión.",
      "sign-in-failed": "No se pudo iniciar sesión con Google.",
    } satisfies Record<SyncError, string>,
    signInTitle: "Guarda tus clases en tu cuenta de Google",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    confirmSignOut: "Algunos cambios aún no se han enviado y se perderán. ¿Cerrar sesión de todos modos?",
    account: "Cuenta {email} — {message}",
  },
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
  const t = useMessages(M);
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
            {t.errors[status.error]}
          </span>
        )}
        <button
          type="button"
          onClick={() => signIn()}
          title={status.error ? t.errors[status.error] : t.signInTitle}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:text-foreground"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">{t.signIn}</span>
        </button>
      </div>
    );
  }

  const { user } = status;
  const message = status.state === "error" ? t.errors[status.error] : t.state[status.state];

  const onSignOut = async () => {
    if (
      status.state !== "synced" &&
      !confirm(t.confirmSignOut)
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
          aria-label={format(t.account, { email: user.email ?? "", message })}
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
            {t.signOut}
          </MenuItem>
        </div>
      )}
    </Popover>
  );
}
