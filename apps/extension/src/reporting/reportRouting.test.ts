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

  it("routes medium and high risk reports as eligible", () => {
    expect(getRoutingDecision(resultFor(30, "medium"))).toBe("eligible");
    expect(getRoutingDecision(resultFor(60, "high"))).toBe("eligible");
  });

  it("holds low or unknown reports from automatic routing", () => {
    expect(getRoutingDecision(resultFor(10, "low"))).toBe("held_low_risk");
    expect(getRoutingDecision(resultFor(0, "unknown"))).toBe("held_low_risk");
    expect(getRoutingDecision(null)).toBe("held_low_risk");
  });
});
