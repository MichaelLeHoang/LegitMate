import type { AnalysisResult, Confidence, DomainAnalysisResponse, PageSignalSummary, RiskLevel, RiskSignal } from "./types";
import type { UrlAnalysis } from "./urlFeatures";

export function buildAnalysisResult(
  urlAnalysis: UrlAnalysis,
  pageSignals: PageSignalSummary | null,
  domainAnalysis: DomainAnalysisResponse | null,
  backendError: string | null
): AnalysisResult {
  const reasons = [
    ...urlAnalysis.signals,
    ...signalsFromPage(pageSignals),
    ...(domainAnalysis?.riskSignals ?? [])
  ];
  const score = Math.min(100, reasons.reduce((sum, reason) => sum + Math.max(0, reason.scoreImpact), 0));
  const riskLevel = classifyRisk(score, reasons);
  const warnings = [...urlAnalysis.warnings];
  if (backendError) warnings.push(`Cloud reputation unavailable: ${backendError}`);

  return {
    checkedUrl: urlAnalysis.checkedUrl,
    hostname: urlAnalysis.hostname,
    domain: urlAnalysis.domain,
    score,
    riskLevel,
    confidence: confidenceFor(reasons, domainAnalysis !== null, pageSignals !== null),
    reasons: reasons.sort((a, b) => b.scoreImpact - a.scoreImpact),
    pageSignals,
    dataSources: [
      "local-url",
      pageSignals ? "page-signals" : null,
      domainAnalysis ? "domain-reputation" : null
    ].filter((source): source is string => Boolean(source)),
    checkedAt: new Date().toISOString(),
    mode: domainAnalysis ? "local-and-cloud" : "local-only",
    warnings
  };
}

export function classifyRisk(score: number, reasons: RiskSignal[]): RiskLevel {
  if (reasons.length === 0) return "unknown";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function confidenceFor(reasons: RiskSignal[], hasBackend: boolean, hasPageSignals: boolean): Confidence {
  if (hasBackend && hasPageSignals && reasons.length >= 2) return "high";
  if (hasBackend || hasPageSignals || reasons.length >= 2) return "medium";
  return "low";
}

function signalsFromPage(pageSignals: PageSignalSummary | null): RiskSignal[] {
  if (!pageSignals) return [];
  const signals: RiskSignal[] = [];

  if (pageSignals.passwordFieldCount > 0) {
    signals.push({
      id: "password-form",
      title: "Login form detected",
      description: "The page contains password fields. Verify the domain before entering credentials.",
      severity: "medium",
      scoreImpact: 14,
      source: "page"
    });
  }

  if (pageSignals.paymentFieldCount > 0) {
    signals.push({
      id: "payment-form",
      title: "Payment form detected",
      description: "The page appears to request payment details.",
      severity: "medium",
      scoreImpact: 16,
      source: "page"
    });
  }

  if (pageSignals.externalFormActions.length > 0) {
    signals.push({
      id: "external-form-action",
      title: "Form submits elsewhere",
      description: "At least one form submits data to a different origin.",
      severity: "high",
      scoreImpact: 22,
      source: "page"
    });
  }

  if (pageSignals.suspiciousTextMatches.length > 0) {
    signals.push({
      id: "suspicious-page-text",
      title: "Suspicious page wording",
      description: `The page contains risky wording: ${pageSignals.suspiciousTextMatches.slice(0, 4).join(", ")}.`,
      severity: "low",
      scoreImpact: Math.min(16, 5 * pageSignals.suspiciousTextMatches.length),
      source: "page"
    });
  }

  if (pageSignals.formCount > 0 && !pageSignals.hasContactSignals && !pageSignals.hasPolicySignals) {
    signals.push({
      id: "forms-without-trust-info",
      title: "Limited visible trust information",
      description: "Forms were found, but common contact or policy signals were not visible on the page.",
      severity: "low",
      scoreImpact: 8,
      source: "page"
    });
  }

  return signals;
}
