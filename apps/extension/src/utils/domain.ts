const IPV4_RE = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6_HINT_RE = /^\[[0-9a-f:]+\]$/i;

const COMMON_SECOND_LEVEL_TLDS = new Set(["co", "com", "net", "org", "gov", "ac", "edu"]);

export function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

export function normalizeHostname(hostname: string): string | null {
  const normalized = hostname.trim().replace(/\.$/, "").toLowerCase();
  if (!normalized) return null;
  return normalized;
}

export function isIpAddress(hostname: string): boolean {
  return IPV4_RE.test(hostname) || IPV6_HINT_RE.test(hostname);
}

export function getRegistrableDomain(hostname: string): string | null {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return null;
  if (isIpAddress(normalized)) return normalized;

  const labels = normalized.split(".").filter(Boolean);
  if (labels.length < 2) return normalized;

  const [secondLevel, topLevel] = labels.slice(-2);
  if (labels.length >= 3 && topLevel.length === 2 && COMMON_SECOND_LEVEL_TLDS.has(secondLevel)) {
    return labels.slice(-3).join(".");
  }

  return labels.slice(-2).join(".");
}

export function countSubdomains(hostname: string): number {
  const domain = getRegistrableDomain(hostname);
  if (!domain || domain === hostname) return 0;
  const suffix = `.${domain}`;
  if (!hostname.endsWith(suffix)) return 0;
  return hostname.slice(0, -suffix.length).split(".").filter(Boolean).length;
}
