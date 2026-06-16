export type RiskLevel = "low" | "medium" | "high" | "unknown";
export type Confidence = "low" | "medium" | "high";
export type SignalSeverity = "info" | "low" | "medium" | "high";
export type SignalSource = "url" | "page" | "reputation" | "rdap" | "system";

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
  result: AnalysisResult;
}
