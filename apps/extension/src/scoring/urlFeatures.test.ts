import { describe, expect, it } from "vitest";
import { analyzeUrl } from "./urlFeatures";

describe("analyzeUrl", () => {
  it("flags unsupported URLs without throwing", () => {
    const result = analyzeUrl("chrome://extensions");
    expect(result.hostname).toBeNull();
    expect(result.signals[0]?.id).toBe("unsupported-url");
  });

  it("flags brand-domain mismatches", () => {
    const result = analyzeUrl("https://secure.paypal.com.example.test/login");
    expect(result.domain).toBe("example.test");
    expect(result.signals.map((signal) => signal.id)).toContain("brand-domain-mismatch");
  });

  it("flags IP address URLs", () => {
    const result = analyzeUrl("http://192.168.0.1/verify");
    expect(result.signals.map((signal) => signal.id)).toEqual(
      expect.arrayContaining(["ip-address-host", "insecure-http", "suspicious-keywords"])
    );
  });
});
