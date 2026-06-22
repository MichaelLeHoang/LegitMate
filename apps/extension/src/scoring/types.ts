export type RiskLevel = "low" | "medium" | "high" | "unknown";
export type Confidence = "low" | "medium" | "high";
export type SignalSeverity = "info" | "low" | "medium" | "high";
export type SignalSource = "url" | "page" | "reputation" | "rdap" | "system";
export type ReportRegion = "US" | "CA";
export type ScamType = "phishing" | "fake_shop" | "crypto" | "impersonation" | "other";
export type ReportRoutingDecision = "eligible" | "held_low_risk";

export interface RiskSignal {
  id: string;
  title: string;
  description: string;
  severity: SignalSeverity;
  scoreImpact: number;
  source: SignalSource;
}

export interface PageSignalSummary {
  formCount: number;
  passwordFieldCount: number;
  paymentFieldCount: number;
  externalFormActions: string[];
  suspiciousTextMatches: string[];
  hasContactSignals: boolean;
  hasPolicySignals: boolean;
}

export interface ReputationFinding {
  source: string;
  status: "match" | "clear" | "unknown";
  description: string;
}

export interface DomainAnalysisResponse {
  domain: string;
  riskSignals: RiskSignal[];
  reputation: {
    feedMatches: ReputationFinding[];
    domainAgeDays: number | null;
    rdapAvailable: boolean;
  };
  checkedAt: string;
}

export interface AnalysisResult {
  checkedUrl: string;
  hostname: string | null;
  domain: string | null;
  score: number;
  riskLevel: RiskLevel;
  confidence: Confidence;
  reasons: RiskSignal[];
  pageSignals: PageSignalSummary | null;
  dataSources: string[];
  checkedAt: string;
  mode: "local-only" | "local-and-cloud";
  warnings: string[];
}

export interface UserFeedback {
  domain: string | null;
  url: string;
  verdict: "safe" | "unsafe";
  scamType?: ScamType;
  region?: ReportRegion;
  routingDecision?: ReportRoutingDecision;
  destinationIds?: string[];
  result: AnalysisResult | null;
}

export interface HistoryEntry {
  id: string;
  hostname: string;
  domain: string | null;
  /** Risk score 0-100 (higher = riskier), mirroring AnalysisResult.score. */
  score: number;
  riskLevel: RiskLevel;
  checkedAt: string;
}

export interface Preferences {
  /** Automatically run a fresh check when the popup opens. */
  autoScanOnOpen: boolean;
  /** Show the LOW/MED/HIGH badge on the toolbar icon. */
  showBadge: boolean;
  /** Disable popup animations. */
  reduceMotion: boolean;
  /** Region used to recommend official scam-reporting destinations. */
  reportRegion: ReportRegion;
}

export const DEFAULT_PREFERENCES: Preferences = {
  autoScanOnOpen: true,
  showBadge: true,
  reduceMotion: false,
  reportRegion: "US"
};
