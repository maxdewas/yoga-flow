"use client";

import {
  ArrowLeft,
  ListOrdered,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { formatClock, formatDuration } from "@/lib/duration";
import { format, useLabels, useLocale, useMessages } from "@/lib/i18n";
import { announcement, playSteps, readyAnnouncement, VOICE, type PlayStep } from "@/lib/player";
import { chime, endChime, gong, speak, stopSpeaking, unlockAudio } from "@/lib/sound";
import { usePoseMap, useStore, type Prefs } from "@/lib/store";
import type { ClassPlan } from "@/lib/types";
import { PoseThumb } from "./PoseThumb";

const M = {
  fr: {
    options: "Options du lecteur", quit: "Quitter le cours", classFallback: "Cours", untitled: "Mon cours",
    ready: "Prêt·e ?", stepsDuration: "{n} étapes · {duration}", start: "Commencer",
    keys: "Espace pour pause · flèches pour naviguer", getReady: "Prépare-toi", firstPose: "Première posture : {name}",
    pose: "Posture", previous: "Posture précédente", resume: "Reprendre", pause: "Pause", next: "Posture suivante",
    paused: "En pause", practiced: "{n} étapes · {duration} de pratique", replay: "Rejouer", back: "Retour au cours",
    upNext: "À suivre · {time}", poseList: "Liste des postures", optionsTitle: "Options", sequence: "Déroulé", close: "Fermer",
    inhale: "Inspire", exhale: "Expire", namaste: "Namasté",
    voice: "Guidage vocal", voiceHint: "Annonce chaque posture", voiceSanskrit: "Noms sanskrits à voix haute",
    voiceCues: "Consignes à voix haute", startGong: "Bol chantant au début", changeChime: "Clochette à chaque posture",
    endChime: "Carillon de fin", screenCues: "Consignes à l'écran", breathGuide: "Guide de respiration animé",
    keepAwake: "Garder l'écran allumé", groups: ["Voix", "Sons", "Affichage"], rhythm: "Rythme",
    countdown: "Compte à rebours", breathLength: "Durée d'une respiration",
  },
  en: {
    options: "Player options", quit: "Leave the class", classFallback: "Class", untitled: "My class",
    ready: "Ready?", stepsDuration: "{n} steps · {duration}", start: "Start",
    keys: "Space to pause · arrows to navigate", getReady: "Get ready", firstPose: "First pose: {name}",
    pose: "Pose", previous: "Previous pose", resume: "Resume", pause: "Pause", next: "Next pose",
    paused: "Paused", practiced: "{n} steps · {duration} of practice", replay: "Play again", back: "Back to the class",
    upNext: "Up next · {time}", poseList: "Pose list", optionsTitle: "Options", sequence: "Sequence", close: "Close",
    inhale: "Inhale", exhale: "Exhale", namaste: "Namaste",
    voice: "Voice guidance", voiceHint: "Announces each pose", voiceSanskrit: "Say Sanskrit names aloud",
    voiceCues: "Say cues aloud", startGong: "Singing bowl at the start", changeChime: "Chime at each pose",
    endChime: "Closing chime", screenCues: "Cues on screen", breathGuide: "Animated breathing guide",
    keepAwake: "Keep the screen on", groups: ["Voice", "Sounds", "Display"], rhythm: "Pace",
    countdown: "Countdown", breathLength: "Length of one breath",
  },
  es: {
    options: "Opciones del reproductor", quit: "Salir de la clase", classFallback: "Clase", untitled: "Mi clase",
    ready: "¿Todo listo?", stepsDuration: "{n} pasos · {duration}", start: "Empezar",
    keys: "Espacio para pausar · flechas para navegar", getReady: "Prepárate", firstPose: "Primera postura: {name}",
    pose: "Postura", previous: "Postura anterior", resume: "Reanudar", pause: "Pausa", next: "Postura siguiente",
    paused: "En pausa", practiced: "{n} pasos · {duration} de práctica", replay: "Repetir", back: "Volver a la clase",
    upNext: "A continuación · {time}", poseList: "Lista de posturas", optionsTitle: "Opciones", sequence: "Secuencia", close: "Cerrar",
    inhale: "Inhala", exhale: "Exhala", namaste: "Namasté",
    voice: "Guía por voz", voiceHint: "Anuncia cada postura", voiceSanskrit: "Nombres en sánscrito en voz alta",
    voiceCues: "Indicaciones en voz alta", startGong: "Cuenco tibetano al empezar", changeChime: "Campanilla en cada postura",
    endChime: "Campanas al final", screenCues: "Indicaciones en pantalla", breathGuide: "Guía de respiración animada",
    keepAwake: "Mantener la pantalla encendida", groups: ["Voz", "Sonidos", "Pantalla"], rhythm: "Ritmo",
    countdown: "Cuenta atrás", breathLength: "Duración de una respiración",
  },
};

type Messages = (typeof M)["fr"];

type Phase = "intro" | "ready" | "pose" | "done";

interface WakeLockLike {
  release: () => Promise<void>;
}

export function Player({ plan }: { plan: ClassPlan }) {
  const poseMap = usePoseMap();
  const opts = useStore((s) => s.prefs.player);
  const showSanskrit = useStore((s) => s.prefs.showSanskrit);
  const setPrefs = useStore((s) => s.setPrefs);
  const t = useMessages(M);
  const L = useLabels();
  const locale = useLocale();
  const steps = useMemo(() => playSteps(plan, poseMap, opts.secondsPerBreath), [plan, poseMap, opts.secondsPerBreath]);
  const totalSeconds = steps.reduce((n, s) => n + s.seconds, 0);

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /** Seconds already spent in the current phase before the last resume. */
  const [banked, setBanked] = useState(0);
  const [resumedAt, setResumedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [sheet, setSheet] = useState<"options" | "list" | null>(null);
  const wake = useRef<WakeLockLike | null>(null);

  const step = steps[index] as PlayStep | undefined;
  const next = steps[index + 1];
  const phaseLength = phase === "ready" ? opts.countdown : (step?.seconds ?? 0);
  const elapsed = paused ? banked : banked + Math.max(0, now - resumedAt) / 1000;
  const remaining = Math.max(0, phaseLength - elapsed);
  const doneBefore = steps.slice(0, index).reduce((n, s) => n + s.seconds, 0);
  const overall = phase === "done" ? 1 : phase === "pose" ? (doneBefore + Math.min(elapsed, phaseLength)) / (totalSeconds || 1) : 0;

  const restartClock = () => {
    const t = performance.now();
    setBanked(0);
    setResumedAt(t);
    setNow(t);
  };

  const enterPose = (i: number) => {
    const s = steps[i];
    if (!s) return finish();
    setIndex(i);
    setPhase("pose");
    restartClock();
    if (opts.changeChime && i > 0) chime();
    if (opts.voice) speak(announcement(s, { sanskrit: opts.voiceSanskrit, cues: opts.voiceCues }, locale), locale);
  };

  const finish = () => {
    setPhase("done");
    setPaused(false);
    if (opts.endChime) endChime();
    if (opts.voice) speak(VOICE[locale].done, locale);
    void wake.current?.release().catch(() => {});
    wake.current = null;
  };

  const start = () => {
    unlockAudio();
    if (opts.keepAwake && "wakeLock" in navigator) {
      (navigator as Navigator & { wakeLock: { request: (t: "screen") => Promise<WakeLockLike> } }).wakeLock
        .request("screen")
        .then((w) => (wake.current = w))
        .catch(() => {});
    }
    if (opts.startGong) gong();
    setIndex(0);
    setPaused(false);
    if (opts.countdown > 0) {
      setPhase("ready");
      restartClock();
      if (opts.voice) speak(readyAnnouncement(steps[0]?.pose, locale), locale);
    } else enterPose(0);
  };

  const togglePause = () => {
    if (phase !== "pose" && phase !== "ready") return;
    const t = performance.now();
    if (paused) {
      setResumedAt(t);
      setNow(t);
      setPaused(false);
    } else {
      setBanked(elapsed);
      setPaused(true);
      stopSpeaking();
    }
  };

  const go = (i: number) => {
    if (i < 0) return;
    setPaused(false);
    enterPose(i);
  };

  // Clock: one tick every 100 ms while the class runs; moves to the next step at the end.
  useEffect(() => {
    if (paused || (phase !== "pose" && phase !== "ready")) return;
    const timer = setInterval(() => {
      const t = performance.now();
      if (banked + (t - resumedAt) / 1000 >= phaseLength) {
        clearInterval(timer);
        if (phase === "ready") enterPose(0);
        else enterPose(index + 1);
      } else setNow(t);
    }, 100);
    return () => clearInterval(timer);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        if (phase === "intro") start();
        else togglePause();
      } else if (e.key === "ArrowRight" && phase === "pose") go(index + 1);
      else if (e.key === "ArrowLeft" && phase === "pose") go(index - 1);
      else if (e.key === "Escape") setSheet(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(
    () => () => {
      stopSpeaking();
      void wake.current?.release().catch(() => {});
    },
    [],
  );

  const backHref = `/cours/${plan.id}`;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,var(--surface)_0%,var(--background)_55%,var(--accent-soft)_130%)] text-foreground">
      <div className="h-1 w-full bg-line/60">
        <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${overall * 100}%` }} />
      </div>

      <div className="flex items-center justify-between px-4 pt-3">
        <button className="icon-btn bg-surface shadow-soft" onClick={() => setSheet(sheet === "options" ? null : "options")} aria-label={t.options}>
          <SlidersHorizontal size={18} />
        </button>
        <p className="truncate px-3 text-xs font-bold tracking-[0.18em] text-muted uppercase">
          {phase === "pose" ? step?.sectionTitle : plan.title || t.classFallback}
        </p>
        <Link href={backHref} className="icon-btn bg-surface shadow-soft" aria-label={t.quit}>
          <X size={18} />
        </Link>
      </div>

      {phase === "intro" && (
        <Centered>
          <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">{t.ready}</p>
          <h1 className="mt-3 max-w-2xl text-center font-display text-4xl font-semibold sm:text-6xl">{plan.title || t.untitled}</h1>
          <p className="mt-3 text-muted">
            {format(t.stepsDuration, { n: steps.length, duration: formatDuration(totalSeconds) })}
          </p>
          <button
            onClick={start}
            className="mt-10 flex h-24 w-24 items-center justify-center rounded-full bg-accent text-surface shadow-lift transition hover:scale-105 active:scale-95"
            aria-label={t.start}
          >
            <Play size={38} fill="currentColor" className="ml-1.5" />
          </button>
          <p className="mt-4 text-sm text-muted">{t.keys}</p>
          {steps.length > 0 && (
            <div className="mt-8 flex -space-x-3">
              {steps.slice(0, 8).map((s) =>
                s.pose ? (
                  <span key={s.key} className="overflow-hidden rounded-full border-2 border-surface shadow-soft">
                    <PoseThumb pose={s.pose} size={48} className="rounded-full" />
                  </span>
                ) : null,
              )}
            </div>
          )}
        </Centered>
      )}

      {phase === "ready" && (
        <Centered>
          <p className="font-display text-4xl font-light tracking-wide sm:text-6xl">{t.getReady}</p>
          <p className="mt-2 text-sm font-bold tracking-[0.2em] text-accent uppercase">{format(t.firstPose, { name: steps[0]?.pose?.name ?? "" })}</p>
          <Ring progress={1 - remaining / (opts.countdown || 1)} size={180} className="mt-10">
            <span className="font-display text-6xl font-semibold tabular-nums">{Math.ceil(remaining)}</span>
          </Ring>
        </Centered>
      )}

      {phase === "pose" && step && (
        <div className="flex min-h-0 flex-1 flex-col items-center px-4 pt-2 pb-4">
          <div className="text-center">
            <h1 className="font-display text-3xl leading-tight font-semibold sm:text-5xl">{step.pose?.name ?? t.pose}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm">
              {step.side && (
                <span className={`rounded-full px-3 py-0.5 font-bold tracking-wider uppercase ${step.side === "droite" ? "bg-clay-soft text-clay" : "bg-lilac-soft text-lilac"}`}>
                  {L.side[step.side]}
                </span>
              )}
              {step.breath !== "aucun" && <span className="rounded-full bg-accent-soft px-3 py-0.5 font-bold text-accent">{L.breath[step.breath]}</span>}
              {showSanskrit && step.pose?.sanskrit && <span className="text-muted italic">{step.pose.sanskrit}</span>}
              <span className="text-muted">
                {index + 1} / {steps.length}
              </span>
            </div>
          </div>

          <div className="relative flex min-h-0 w-full flex-1 items-center justify-center py-4">
            <BreathHalo labels={[t.inhale, t.exhale]} active={opts.breathGuide && !!step.breaths && !paused} spb={opts.secondsPerBreath} elapsed={elapsed}>
              {step.pose && (
                <div className="aspect-square h-[min(62vw,42vh)] max-h-[440px] overflow-hidden rounded-[2.5rem] bg-thumb shadow-lift">
                  <PoseThumb pose={step.pose} className="h-full rounded-none" />
                </div>
              )}
            </BreathHalo>
          </div>

          {opts.screenCues && (step.cue || step.pose?.details?.cuesShort?.length) ? (
            <p className="mb-3 max-w-xl text-center text-base text-muted sm:text-lg">
              {step.cue.trim() || step.pose?.details?.cuesShort?.slice(0, 2).join(" ")}
            </p>
          ) : null}

          <div className="flex items-center gap-5">
            <button className="icon-btn h-12 w-12 bg-surface shadow-soft" onClick={() => go(index - 1)} disabled={index === 0} aria-label={t.previous}>
              <SkipBack size={20} />
            </button>
            <button onClick={togglePause} aria-label={paused ? t.resume : t.pause} className="relative">
              <Ring progress={elapsed / (phaseLength || 1)} size={112}>
                <span className="flex flex-col items-center">
                  <span className="font-display text-2xl font-semibold tabular-nums">{formatClock(remaining)}</span>
                  <span className="text-muted">{paused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}</span>
                </span>
              </Ring>
            </button>
            <button className="icon-btn h-12 w-12 bg-surface shadow-soft" onClick={() => go(index + 1)} aria-label={t.next}>
              <SkipForward size={20} />
            </button>
          </div>
          {paused && <p className="mt-2 text-xs font-bold tracking-widest text-muted uppercase">{t.paused}</p>}
        </div>
      )}

      {phase === "done" && (
        <Centered>
          <p className="text-6xl">🙏</p>
          <h1 className="mt-4 font-display text-5xl font-semibold sm:text-6xl">{t.namaste}</h1>
          <p className="mt-3 text-muted">
            {format(t.practiced, { n: steps.length, duration: formatDuration(totalSeconds) })}
          </p>
          <div className="mt-8 flex gap-3">
            <button className="btn" onClick={start}>
              <RotateCcw size={16} /> {t.replay}
            </button>
            <Link href={backHref} className="btn-primary">
              <ArrowLeft size={16} /> {t.back}
            </Link>
          </div>
        </Centered>
      )}

      {phase === "pose" && next && (
        <button
          onClick={() => go(index + 1)}
          className="absolute right-4 bottom-4 hidden w-44 items-center gap-3 rounded-2xl bg-surface p-2.5 text-left shadow-lift md:flex"
        >
          {next.pose && <PoseThumb pose={next.pose} size={48} className="rounded-xl" />}
          <span className="min-w-0">
            <span className="block text-[10px] font-bold tracking-widest text-muted uppercase">{format(t.upNext, { time: formatClock(next.seconds) })}</span>
            <span className="block truncate text-sm font-semibold">{next.pose?.name}</span>
            {next.side && <span className="block text-[11px] text-muted">{L.sideShort[next.side]}</span>}
          </span>
        </button>
      )}

      {phase !== "intro" && phase !== "done" && (
        <button className="icon-btn absolute bottom-4 left-4 h-11 w-11 bg-surface shadow-soft" onClick={() => setSheet(sheet === "list" ? null : "list")} aria-label={t.poseList}>
          <ListOrdered size={18} />
        </button>
      )}

      {sheet && (
        <div className="absolute inset-0 z-10 flex animate-fade justify-start bg-black/25" onClick={() => setSheet(null)}>
          <div className="h-full w-full max-w-sm animate-rise overflow-y-auto bg-background p-5 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">{sheet === "options" ? t.optionsTitle : t.sequence}</h2>
              <button className="icon-btn" onClick={() => setSheet(null)} aria-label={t.close}>
                <X size={18} />
              </button>
            </div>
            {sheet === "options" ? (
              <PlayerOptions t={t} opts={opts} onChange={(p) => setPrefs({ player: p })} />
            ) : (
              <ol className="space-y-1">
                {steps.map((s, i) => (
                  <li key={s.key}>
                    <button
                      onClick={() => {
                        setSheet(null);
                        go(i);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition ${
                        i === index && phase === "pose" ? "bg-accent-soft" : i < index ? "opacity-50 hover:bg-surface-2" : "hover:bg-surface-2"
                      }`}
                    >
                      <span className="w-5 text-right text-xs text-muted">{i + 1}</span>
                      {s.pose && <PoseThumb pose={s.pose} size={36} className="rounded-lg" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{s.pose?.name}</span>
                        <span className="block text-[11px] text-muted">
                          {formatClock(s.seconds)}
                          {s.side && ` · ${L.sideShort[s.side]}`}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 animate-fade flex-col items-center justify-center px-6 pb-10 text-center">{children}</div>;
}

function Ring({ progress, size, className = "", children }: { progress: number; size: number; className?: string; children: ReactNode }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-surface shadow-soft ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, progress)))}
          className="transition-[stroke-dashoffset] duration-100"
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

/** Halo that widens on the inhale and narrows on the exhale, at the chosen pace. */
function BreathHalo({ labels, active, spb, elapsed, children }: { labels: [string, string]; active: boolean; spb: number; elapsed: number; children: ReactNode }) {
  const inhale = active && elapsed % spb < spb / 2;
  return (
    <div className="relative flex items-center justify-center">
      {active && (
        <>
          <div
            className="absolute inset-0 rounded-[3rem] bg-accent/15 ease-in-out"
            style={{ transform: `scale(${inhale ? 1.12 : 1.0})`, transition: `transform ${spb / 2}s ease-in-out` }}
          />
          <span className="absolute -bottom-3 z-[1] rounded-full bg-surface px-3 py-1 text-xs font-bold tracking-widest text-accent uppercase shadow-soft">
            {inhale ? labels[0] : labels[1]}
          </span>
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function PlayerOptions({ t, opts, onChange }: { t: Messages; opts: Prefs["player"]; onChange: (p: Partial<Prefs["player"]>) => void }) {
  const toggles: [keyof Prefs["player"], string, string?][][] = [
    [
      ["voice", t.voice, t.voiceHint],
      ["voiceSanskrit", t.voiceSanskrit],
      ["voiceCues", t.voiceCues],
    ],
    [
      ["startGong", t.startGong],
      ["changeChime", t.changeChime],
      ["endChime", t.endChime],
    ],
    [
      ["screenCues", t.screenCues],
      ["breathGuide", t.breathGuide],
      ["keepAwake", t.keepAwake],
    ],
  ];
  const titles = t.groups;
  return (
    <div className="space-y-5">
      {toggles.map((group, gi) => (
        <section key={titles[gi]}>
          <h3 className="mb-1.5 text-[11px] font-bold tracking-wider text-muted uppercase">{titles[gi]}</h3>
          <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {group.map(([key, label, hint]) => (
              <label key={key} className="flex cursor-pointer items-center gap-3 px-3.5 py-3">
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{label}</span>
                  {hint && <span className="block text-xs text-muted">{hint}</span>}
                </span>
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={opts[key] as boolean}
                  onChange={(e) => onChange({ [key]: e.target.checked })}
                />
                <span className="relative h-6 w-10 rounded-full bg-line transition peer-checked:bg-accent after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-surface after:shadow after:transition peer-checked:after:translate-x-4" />
              </label>
            ))}
          </div>
        </section>
      ))}
      <section>
        <h3 className="mb-1.5 text-[11px] font-bold tracking-wider text-muted uppercase">{t.rhythm}</h3>
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-3.5">
          <Stepper label={t.countdown} value={opts.countdown} unit="s" options={[0, 3, 5, 10]} onChange={(v) => onChange({ countdown: v })} />
          <Stepper
            label={t.breathLength}
            value={opts.secondsPerBreath}
            unit="s"
            options={[3, 4, 5, 6, 8]}
            onChange={(v) => onChange({ secondsPerBreath: v })}
          />
        </div>
      </section>
    </div>
  );
}

function Stepper({ label, value, unit, options, onChange }: { label: string; value: number; unit: string; options: number[]; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button key={o} className="chip flex-1 justify-center" data-active={o === value} onClick={() => onChange(o)}>
            {o} {unit}
          </button>
        ))}
      </div>
    </div>
  );
}
