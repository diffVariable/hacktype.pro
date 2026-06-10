import { CHARS_PER_WORD } from "../constants";
import type { IClearanceRank } from "../types";

export function calcWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  return correctChars / CHARS_PER_WORD / minutes;
}

export function calcAccuracy(correctChars: number, typedChars: number): number {
  if (typedChars <= 0) return 100;
  return (correctChars / typedChars) * 100;
}

export function calcTraceProbability(wpm: number): string {
  return Math.max(0.1, (100 - wpm) / 10).toFixed(1);
}

// wpm scaled by accuracy squared: clean runs keep their speed,
// sloppy ones sink fast
export function calcBreachScore(wpm: number, accuracy: number): number {
  const factor = accuracy / 100;
  return Math.round(wpm * factor * factor);
}

// clearance ladder, highest first
const CLEARANCE_RANKS: ReadonlyArray<{ min: number } & IClearanceRank> = [
  { min: 100, name: "void walker", blurb: "beyond the system entirely." },
  {
    min: 80,
    name: "ghost kernel",
    blurb: "deep in the machine, no footprints left.",
  },
  {
    min: 60,
    name: "soft shell",
    blurb: "comfy in the terminal, fluent in silence.",
  },
  { min: 40, name: "warm socket", blurb: "connected. cozy. getting there." },
  { min: 20, name: "fuzzy packet", blurb: "something got through. mostly." },
  { min: 0, name: "sleepy port", blurb: "open but not really listening." },
];

export function getClearanceRank(breachScore: number): IClearanceRank {
  const tier =
    CLEARANCE_RANKS.find((r) => breachScore >= r.min) ??
    CLEARANCE_RANKS[CLEARANCE_RANKS.length - 1];
  return { name: tier.name, blurb: tier.blurb };
}
