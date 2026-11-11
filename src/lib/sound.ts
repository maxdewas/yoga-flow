"use client";

import type { Locale } from "./locale";

/** Sons du lecteur, synthétisés à la volée (aucun fichier audio à charger). */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function partial(ac: AudioContext, freq: number, gain: number, decay: number, at: number) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  osc.connect(g).connect(ac.destination);
  osc.start(at);
  osc.stop(at + decay + 0.05);
}

/** Bol chantant grave, pour ouvrir la séance. */
export function gong() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  [
    [196, 0.22, 5],
    [392.7, 0.1, 4],
    [589, 0.06, 3.2],
    [823, 0.035, 2.4],
  ].forEach(([f, g, d]) => partial(ac, f, g, d, t));
}

/** Clochette légère au changement de posture. */
export function chime() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  partial(ac, 1046.5, 0.08, 1.4, t);
  partial(ac, 1568, 0.04, 1, t);
}

/** Deux notes descendantes pour finir. */
export function endChime() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  partial(ac, 784, 0.09, 1.8, t);
  partial(ac, 523.25, 0.1, 2.6, t + 0.35);
  partial(ac, 261.6, 0.08, 3.4, t + 0.7);
}

/** Débloque l'audio sur iOS : à appeler pendant un geste de l'utilisateur. */
export function unlockAudio() {
  audio();
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.getVoices();
}

/** Utterance language and preferred natural-sounding voices, per interface language. */
const SPEECH: Record<Locale, { lang: string; voices: RegExp }> = {
  fr: { lang: "fr-FR", voices: /amélie|audrey|marie|thomas/i },
  en: { lang: "en-GB", voices: /serena|kate|daniel|martha|arthur/i },
  es: { lang: "es-ES", voices: /mónica|monica|marisol|jorge|paulina/i },
};

export function speak(text: string, locale: Locale = "fr") {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const { lang, voices } = SPEECH[locale];
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  const all = synth.getVoices();
  const exact = all.filter((v) => v.lang.toLowerCase().replace("_", "-") === lang.toLowerCase());
  const sameLanguage = all.filter((v) => v.lang.toLowerCase().startsWith(locale));
  const voice = exact.find((v) => voices.test(v.name)) ?? sameLanguage.find((v) => voices.test(v.name)) ?? exact[0] ?? sameLanguage[0];
  if (voice) u.voice = voice;
  synth.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
