import type { AnalysisResult, RiskLevel } from "../scoring/types";

/**
 * The "egg detective" presentation layer. The backend/scoring model speaks in a
 * RISK score (0 = safe, 100 = dangerous) and a `riskLevel`; the mascot design
 * speaks in a TRUST score (100 = good egg, 0 = rotten egg). This module is the
 * single place that bridges the two so the rest of the popup stays presentational.
 */
export type EggRating = "GOOD" | "CAREFUL" | "CRACKED" | "ROTTEN" | "LOADING" | "UNKNOWN";

export interface EggView {
  rating: EggRating;
  /** 0-100 where higher is safer; null when there is no result yet. */
  trustScore: number | null;
  /** Prominent state label, e.g. "🟢 Good Egg". */
  label: string;
  /** Short verdict shown next to "Verdict:". */
  statusText: string;
  /** One-line plain-English summary. */
  description: string;
  /** Tailwind text-color class for the state label/accents. */
  toneClass: string;
  /** Ring/accent hex used by the SVG score ring. */
  accent: string;
  badgeText: string;
  badgeBg: string;
}

export function ratingFromRisk(riskLevel: RiskLevel, score: number): EggRating {
  switch (riskLevel) {
    case "low":
      return "GOOD";
    case "medium":
      return "CAREFUL";
    case "high":
      return score >= 80 ? "ROTTEN" : "CRACKED";
    default:
      return "UNKNOWN";
  }
}

export function toEggRating(result: AnalysisResult): EggRating {
  return ratingFromRisk(result.riskLevel, result.score);
}

export function trustScore(result: AnalysisResult): number {
  return Math.max(0, Math.min(100, 100 - result.score));
}

const TONE: Record<EggRating, Omit<EggView, "trustScore" | "statusText" | "description">> = {
  GOOD: {
    rating: "GOOD",
    label: "🟢 Good Egg",
    toneClass: "text-brand-green",
    accent: "#4CAF50",
    badgeText: "Safe Site",
    badgeBg: "bg-brand-green text-white"
  },
  CAREFUL: {
    rating: "CAREFUL",
    label: "🟡 Careful Egg",
    toneClass: "text-brand-orange",
    accent: "#FF9F1C",
    badgeText: "Suspicious",
    badgeBg: "bg-brand-orange text-white"
  },
  CRACKED: {
    rating: "CRACKED",
    label: "🟠 Cracked Egg",
    toneClass: "text-brand-deep",
    accent: "#E86A17",
    badgeText: "High Risk",
    badgeBg: "bg-brand-deep text-white"
  },
  ROTTEN: {
    rating: "ROTTEN",
    label: "🔴 Rotten Egg",
    toneClass: "text-brand-red",
    accent: "#EF4444",
    badgeText: "Danger",
    badgeBg: "bg-brand-red text-white"
  },
  LOADING: {
    rating: "LOADING",
    label: "🐣 Scrambling Egg…",
    toneClass: "text-brand-orange",
    accent: "#FF9F1C",
    badgeText: "Checking…",
    badgeBg: "bg-brand-orange text-white"
  },
  UNKNOWN: {
    rating: "UNKNOWN",
    label: "🥚 Mystery Egg",
    toneClass: "text-brand-dark",
    accent: "#2D2A26",
    badgeText: "Unknown",
    badgeBg: "bg-brand-dark text-white"
  }
};

const STATUS_TEXT: Record<EggRating, string> = {
  GOOD: "Looks legit",
  CAREFUL: "Stay alert",
  CRACKED: "High risk",
  ROTTEN: "Likely a scam",
  LOADING: "Reviewing indicators…",
  UNKNOWN: "Not checked yet"
};

const DESCRIPTION: Record<EggRating, string> = {
  GOOD: "This domain checks out. No strong risk signals were found — keep browsing safely.",
  CAREFUL: "Some risk flags showed up. Likely fine, but stay alert for unusual requests.",
  CRACKED: "Notable risk flags detected. Be careful with any forms or payment fields here.",
  ROTTEN: "Strong scam/phishing indicators detected. Avoid entering any personal info.",
  LOADING: "Scanning the registrable domain, page signals, and reputation feeds…",
  UNKNOWN: "Run a check on the active tab to generate an explainable risk report."
};

export type EggTone = Pick<EggView, "rating" | "label" | "toneClass" | "accent" | "badgeText" | "badgeBg">;

/** Tone metadata (colors, label, badge) for a rating, without scan-specific text. */
export function toneFor(rating: EggRating): EggTone {
  return TONE[rating];
}

/** Build the full presentation view for a result (or the empty/loading states). */
export function eggView(result: AnalysisResult | null, isScanning: boolean): EggView {
  const rating: EggRating = isScanning ? "LOADING" : result ? toEggRating(result) : "UNKNOWN";
  const base = TONE[rating];
  return {
    ...base,
    trustScore: isScanning || !result ? null : trustScore(result),
    statusText: STATUS_TEXT[rating],
    description: DESCRIPTION[rating]
  };
}

/** Dot color for a single reason, by signal severity. */
export function severityDotClass(severity: string): string {
  switch (severity) {
    case "high":
      return "bg-brand-red";
    case "medium":
      return "bg-brand-orange";
    default:
      return "bg-brand-green";
  }
}
