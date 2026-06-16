import { describe, expect, it } from "vitest";
import { buildAnalysisResult, classifyRisk } from "./scoring";
import type { RiskSignal } from "./types";
import type { UrlAnalysis } from "./urlFeatures";

const highSignal: RiskSignal = {
  id: "test-high",
  title: "High",
  description: "High risk",
  severity: "high",
  scoreImpact: 65,
  source: "url"
};

describe("scoring", () => {
  it("classifies risk levels by score", () => {
    expect(classifyRisk(0, [])).toBe("unknown");
    expect(classifyRisk(10, [highSignal])).toBe("low");
    expect(classifyRisk(35, [highSignal])).toBe("medium");
    expect(classifyRisk(60, [highSignal])).toBe("high");
  });

  it("builds a local-only result when backend is unavailable", () => {
    const urlAnalysis: UrlAnalysis = {
      checkedUrl: "https://example.test/login",
      hostname: "example.test",
      domain: "example.test",
      signals: [highSignal],
      warnings: []
    };

    const result = buildAnalysisResult(urlAnalysis, null, null, "request timed out");

    expect(result.mode).toBe("local-only");
    expect(result.riskLevel).toBe("high");
    expect(result.warnings).toContain("Cloud reputation unavailable: request timed out");
  });
});
