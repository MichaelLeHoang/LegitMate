import { countSubdomains, getRegistrableDomain, isIpAddress, parseHttpUrl } from "../utils/domain";
import type { RiskSignal } from "./types";

const SUSPICIOUS_KEYWORDS = [
  "verify",
  "login",
  "secure",
  "wallet",
  "claim",
  "gift",
  "bonus",
  "support",
  "update",
  "confirm",
  "password",
  "recovery"
];

const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rebrand.ly"
]);

const BRAND_DOMAINS = new Map<string, string[]>([
  ["paypal", ["paypal.com"]],
  ["google", ["google.com"]],
  ["microsoft", ["microsoft.com", "live.com", "office.com"]],
  ["apple", ["apple.com"]],
  ["amazon", ["amazon.com"]],
  ["facebook", ["facebook.com", "meta.com"]],
  ["instagram", ["instagram.com"]],
  ["netflix", ["netflix.com"]],
  ["coinbase", ["coinbase.com"]],
  ["binance", ["binance.com"]]
]);

export interface UrlAnalysis {
  checkedUrl: string;
  hostname: string | null;
  domain: string | null;
  signals: RiskSignal[];
  warnings: string[];
}

export function analyzeUrl(value: string): UrlAnalysis {
  const url = parseHttpUrl(value);
  if (!url) {
    return {
      checkedUrl: value,
      hostname: null,
      domain: null,
      signals: [
        {
          id: "unsupported-url",
          title: "Unsupported page",
          description: "LegitMate can only check http and https pages.",
          severity: "info",
          scoreImpact: 0,
          source: "system"
        }
      ],
      warnings: ["Unsupported page type."]
    };
  }

  const hostname = url.hostname.toLowerCase();
  const domain = getRegistrableDomain(hostname);
  const signals: RiskSignal[] = [];
  const lowerUrl = url.toString().toLowerCase();

  if (url.protocol === "http:") {
    signals.push(signal("insecure-http", "Missing HTTPS", "The page is using plain HTTP.", "medium", 18));
  }

  if (isIpAddress(hostname)) {
    signals.push(
      signal("ip-address-host", "IP address URL", "The site uses an IP address instead of a domain name.", "high", 35)
    );
  }

  if (hostname.includes("xn--")) {
    signals.push(
      signal("punycode-host", "Punycode domain", "The domain uses punycode, which can hide lookalike characters.", "high", 30)
    );
  }

  if (/%[0-9a-f]{2}/i.test(url.pathname + url.search)) {
    signals.push(
      signal("encoded-url", "Encoded URL characters", "The URL contains encoded characters that can obscure its destination.", "low", 10)
    );
  }

  if (url.username || url.password || value.includes("@")) {
    signals.push(
      signal("at-symbol-url", "At-symbol in URL", "The URL contains an at-symbol, which can be used to disguise the real host.", "high", 25)
    );
  }

  if (value.length > 120) {
    signals.push(
      signal("long-url", "Unusually long URL", "Long URLs can hide suspicious paths or redirect parameters.", "low", 10)
    );
  }

  const subdomainCount = countSubdomains(hostname);
  if (subdomainCount >= 3) {
    signals.push(
      signal("many-subdomains", "Many subdomains", "The host has several subdomain levels, which can be used for impersonation.", "medium", 18)
    );
  }

  if (domain && URL_SHORTENERS.has(domain)) {
    signals.push(
      signal("url-shortener", "URL shortener", "The destination uses a known URL shortener, hiding the final site.", "medium", 16)
    );
  }

  const keywordMatches = SUSPICIOUS_KEYWORDS.filter((keyword) => lowerUrl.includes(keyword));
  if (keywordMatches.length > 0) {
    signals.push(
      signal(
        "suspicious-keywords",
        "Suspicious URL wording",
        `The URL contains scam-prone wording: ${keywordMatches.slice(0, 4).join(", ")}.`,
        keywordMatches.length >= 3 ? "medium" : "low",
        Math.min(22, 7 * keywordMatches.length)
      )
    );
  }

  const brandSignal = detectBrandMismatch(hostname, domain);
  if (brandSignal) signals.push(brandSignal);

  return {
    checkedUrl: url.toString(),
    hostname,
    domain,
    signals,
    warnings: []
  };
}

function detectBrandMismatch(hostname: string, domain: string | null): RiskSignal | null {
  if (!domain) return null;

  for (const [brand, allowedDomains] of BRAND_DOMAINS.entries()) {
    const domainWithoutDots = domain.replaceAll(".", "");
    if (!hostname.includes(brand)) continue;
    if (allowedDomains.includes(domain)) return null;
    if (
      domainWithoutDots.includes(brand) ||
      hostname.includes(`${brand}.`) ||
      hostname.includes(`${brand}-`) ||
      hostname.includes(`-${brand}`)
    ) {
      return signal(
        "brand-domain-mismatch",
        "Possible brand impersonation",
        `The host mentions ${brand}, but the registrable domain is ${domain}.`,
        "high",
        30
      );
    }
  }

  return null;
}

function signal(
  id: string,
  title: string,
  description: string,
  severity: RiskSignal["severity"],
  scoreImpact: number
): RiskSignal {
  return {
    id,
    title,
    description,
    severity,
    scoreImpact,
    source: "url"
  };
}
