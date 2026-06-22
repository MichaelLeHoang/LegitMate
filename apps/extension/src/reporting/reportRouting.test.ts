import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES, type AnalysisResult } from "../scoring/types";
import { getReportDestinations, getRoutingDecision } from "./reportRouting";

function resultFor(score: number, riskLevel: AnalysisResult["riskLevel"]): AnalysisResult {
  return {
    checkedUrl: "https://example.test/login",
    hostname: "example.test",
    domain: "example.test",
    score,
    riskLevel,
    confidence: "medium",
    reasons: [],
    pageSignals: null,
    dataSources: ["url"],
    checkedAt: new Date().toISOString(),
    mode: "local-only",
    warnings: []
  };
}

describe("report routing", () => {
  it("defaults report region to the United States", () => {
    expect(DEFAULT_PREFERENCES.reportRegion).toBe("US");
  });

  it("returns official destinations for supported regions", () => {
    expect(getReportDestinations("US", "phishing").map((destination) => destination.id)).toEqual(
      expect.arrayContaining(["us-ftc-reportfraud", "us-ic3"])
    );
    expect(getReportDestinations("CA", "phishing").map((destination) => destination.id)).toEqual(
      expect.arrayContaining(["ca-cafc", "ca-cyber-centre"])
    );
  });

  it("prioritizes medium and high risk reports for review", () => {
    expect(getRoutingDecision(resultFor(30, "medium"))).toBe("review_priority");
    expect(getRoutingDecision(resultFor(60, "high"))).toBe("review_priority");
  });

  it("keeps low or unknown reports at standard review priority", () => {
    expect(getRoutingDecision(resultFor(10, "low"))).toBe("standard_review");
    expect(getRoutingDecision(resultFor(0, "unknown"))).toBe("standard_review");
    expect(getRoutingDecision(null)).toBe("standard_review");
  });
});
