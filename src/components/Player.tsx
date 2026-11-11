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
import { announcement, playSteps, type PlayStep } from "@/lib/player";
import { chime, endChime, gong, speak, stopSpeaking, unlockAudio } from "@/lib/sound";
import { usePoseMap, useStore, type Prefs } from "@/lib/store";
import { BREATH_LABELS, type ClassPlan } from "@/lib/types";
import { PoseThumb } from "./PoseThumb";

type Phase = "intro" | "ready" | "pose" | "done";

interface WakeLockLike {
  release: () => Promise<void>;
}

export function Player({ plan }: { plan: ClassPlan }) {
  const poseMap = usePoseMap();
  const opts = useStore((s) => s.prefs.player);
  const showSanskrit = useStore((s) => s.prefs.showSanskrit);
  const setPrefs = useStore((s) => s.setPrefs);
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
    if (opts.voice) speak(announcement(s, { sanskrit: opts.voiceSanskrit, cues: opts.voiceCues }));
  };

  const finish = () => {
    setPhase("done");
    setPaused(false);
    if (opts.endChime) endChime();
    if (opts.voice) speak("C'est terminé. Prends un instant pour ressentir les effets de ta pratique. Namasté.");
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
      if (opts.voice) speak(`Prépare-toi. Première posture : ${steps[0]?.pose?.nameFr ?? ""}.`);
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

  // Horloge : un tick toutes les 100 ms tant que le cours tourne ; passe à l'étape suivante à la fin.
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
        <button className="icon-btn bg-surface shadow-soft" onClick={() => setSheet(sheet === "options" ? null : "options")} aria-label="Options du lecteur">
          <SlidersHorizontal size={18} />
        </button>
        <p className="truncate px-3 text-xs font-bold tracking-[0.18em] text-muted uppercase">
          {phase === "pose" ? step?.sectionTitle : plan.title || "Cours"}
        </p>
        <Link href={backHref} className="icon-btn bg-surface shadow-soft" aria-label="Quitter le cours">
          <X size={18} />
        </Link>
      </div>

      {phase === "intro" && (
        <Centered>
          <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">Prêt·e ?</p>
          <h1 className="mt-3 max-w-2xl text-center font-display text-4xl font-semibold sm:text-6xl">{plan.title || "Mon cours"}</h1>
          <p className="mt-3 text-muted">
            {steps.length} étapes · {formatDuration(totalSeconds)}
          </p>
          <button
            onClick={start}
            className="mt-10 flex h-24 w-24 items-center justify-center rounded-full bg-accent text-surface shadow-lift transition hover:scale-105 active:scale-95"
            aria-label="Commencer"
          >
            <Play size={38} fill="currentColor" className="ml-1.5" />
          </button>
          <p className="mt-4 text-sm text-muted">Espace pour pause · flèches pour naviguer</p>
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
          <p className="font-display text-4xl font-light tracking-wide sm:text-6xl">Prépare-toi</p>
          <p className="mt-2 text-sm font-bold tracking-[0.2em] text-accent uppercase">Première posture : {steps[0]?.pose?.nameFr}</p>
          <Ring progress={1 - remaining / (opts.countdown || 1)} size={180} className="mt-10">
            <span className="font-display text-6xl font-semibold tabular-nums">{Math.ceil(remaining)}</span>
          </Ring>
        </Centered>
      )}

      {phase === "pose" && step && (
        <div className="flex min-h-0 flex-1 flex-col items-center px-4 pt-2 pb-4">
          <div className="text-center">
            <h1 className="font-display text-3xl leading-tight font-semibold sm:text-5xl">{step.pose?.nameFr ?? "Posture"}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm">
              {step.side && (
                <span className={`rounded-full px-3 py-0.5 font-bold tracking-wider uppercase ${step.side === "droite" ? "bg-clay-soft text-clay" : "bg-lilac-soft text-lilac"}`}>
                  {step.side === "droite" ? "Côté droit" : "Côté gauche"}
                </span>
              )}
              {step.breath !== "aucun" && <span className="rounded-full bg-accent-soft px-3 py-0.5 font-bold text-accent">{BREATH_LABELS[step.breath]}</span>}
              {showSanskrit && step.pose?.sanskrit && <span className="text-muted italic">{step.pose.sanskrit}</span>}
              <span className="text-muted">
                {index + 1} / {steps.length}
              </span>
            </div>
          </div>

          <div className="relative flex min-h-0 w-full flex-1 items-center justify-center py-4">
            <BreathHalo active={opts.breathGuide && !!step.breaths && !paused} spb={opts.secondsPerBreath} elapsed={elapsed}>
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
            <button className="icon-btn h-12 w-12 bg-surface shadow-soft" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Posture précédente">
              <SkipBack size={20} />
            </button>
            <button onClick={togglePause} aria-label={paused ? "Reprendre" : "Pause"} className="relative">
              <Ring progress={elapsed / (phaseLength || 1)} size={112}>
                <span className="flex flex-col items-center">
                  <span className="font-display text-2xl font-semibold tabular-nums">{formatClock(remaining)}</span>
                  <span className="text-muted">{paused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}</span>
                </span>
              </Ring>
            </button>
            <button className="icon-btn h-12 w-12 bg-surface shadow-soft" onClick={() => go(index + 1)} aria-label="Posture suivante">
              <SkipForward size={20} />
            </button>
          </div>
          {paused && <p className="mt-2 text-xs font-bold tracking-widest text-muted uppercase">En pause</p>}
        </div>
      )}

      {phase === "done" && (
        <Centered>
          <p className="text-6xl">🙏</p>
          <h1 className="mt-4 font-display text-5xl font-semibold sm:text-6xl">Namasté</h1>
          <p className="mt-3 text-muted">
            {steps.length} étapes · {formatDuration(totalSeconds)} de pratique
          </p>
          <div className="mt-8 flex gap-3">
            <button className="btn" onClick={start}>
              <RotateCcw size={16} /> Rejouer
            </button>
            <Link href={backHref} className="btn-primary">
              <ArrowLeft size={16} /> Retour au cours
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
            <span className="block text-[10px] font-bold tracking-widest text-muted uppercase">À suivre · {formatClock(next.seconds)}</span>
            <span className="block truncate text-sm font-semibold">{next.pose?.nameFr}</span>
            {next.side && <span className="block text-[11px] text-muted">{next.side === "droite" ? "Droite" : "Gauche"}</span>}
          </span>
        </button>
      )}

      {phase !== "intro" && phase !== "done" && (
        <button className="icon-btn absolute bottom-4 left-4 h-11 w-11 bg-surface shadow-soft" onClick={() => setSheet(sheet === "list" ? null : "list")} aria-label="Liste des postures">
          <ListOrdered size={18} />
        </button>
      )}

      {sheet && (
        <div className="absolute inset-0 z-10 flex animate-fade justify-start bg-black/25" onClick={() => setSheet(null)}>
          <div className="h-full w-full max-w-sm animate-rise overflow-y-auto bg-background p-5 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">{sheet === "options" ? "Options" : "Déroulé"}</h2>
              <button className="icon-btn" onClick={() => setSheet(null)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            {sheet === "options" ? (
              <PlayerOptions opts={opts} onChange={(p) => setPrefs({ player: p })} />
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
                        <span className="block truncate text-sm font-semibold">{s.pose?.nameFr}</span>
                        <span className="block text-[11px] text-muted">
                          {formatClock(s.seconds)}
                          {s.side && ` · ${s.side}`}
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

/** Halo qui s'élargit à l'inspiration et se resserre à l'expiration, au rythme choisi. */
function BreathHalo({ active, spb, elapsed, children }: { active: boolean; spb: number; elapsed: number; children: ReactNode }) {
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
            {inhale ? "Inspire" : "Expire"}
          </span>
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function PlayerOptions({ opts, onChange }: { opts: Prefs["player"]; onChange: (p: Partial<Prefs["player"]>) => void }) {
  const toggles: [keyof Prefs["player"], string, string?][][] = [
    [
      ["voice", "Guidage vocal", "Annonce chaque posture"],
      ["voiceSanskrit", "Noms sanskrits à voix haute"],
      ["voiceCues", "Consignes à voix haute"],
    ],
    [
      ["startGong", "Bol chantant au début"],
      ["changeChime", "Clochette à chaque posture"],
      ["endChime", "Carillon de fin"],
    ],
    [
      ["screenCues", "Consignes à l'écran"],
      ["breathGuide", "Guide de respiration animé"],
      ["keepAwake", "Garder l'écran allumé"],
    ],
  ];
  const titles = ["Voix", "Sons", "Affichage"];
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
        <h3 className="mb-1.5 text-[11px] font-bold tracking-wider text-muted uppercase">Rythme</h3>
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-3.5">
          <Stepper label="Compte à rebours" value={opts.countdown} unit="s" options={[0, 3, 5, 10]} onChange={(v) => onChange({ countdown: v })} />
          <Stepper
            label="Durée d'une respiration"
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
