import { describe, expect, it } from "vitest";
import { countSubdomains, getRegistrableDomain, isIpAddress, parseHttpUrl } from "./domain";

describe("domain utilities", () => {
  it("parses only http and https URLs", () => {
    expect(parseHttpUrl("https://example.com")).toBeInstanceOf(URL);
    expect(parseHttpUrl("chrome://extensions")).toBeNull();
  });

  it("extracts common registrable domains", () => {
    expect(getRegistrableDomain("secure.paypal.com.example.test")).toBe("example.test");
    expect(getRegistrableDomain("login.example.co.uk")).toBe("example.co.uk");
  });

  it("counts subdomains before the registrable domain", () => {
    expect(countSubdomains("a.b.c.example.com")).toBe(3);
    expect(countSubdomains("example.com")).toBe(0);
  });

  it("detects IP address hosts", () => {
    expect(isIpAddress("127.0.0.1")).toBe(true);
    expect(isIpAddress("example.com")).toBe(false);
  });
});
