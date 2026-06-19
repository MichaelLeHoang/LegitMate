/**
 * Centralized, env-driven settings for the web dashboard.
 *
 * Values come from Vite env vars (`VITE_*`, see `.env` / `.env.example`) and fall
 * back to sensible defaults so the site still runs with no `.env` present. Only
 * `VITE_`-prefixed vars are exposed to the client bundle by Vite.
 */
const env = import.meta.env;

const clean = (value: string | undefined): string => (value ?? "").trim();

export const config = {
  /** App version shown in the hero "New v…" tag. */
  version: clean(env.VITE_APP_VERSION) || "2.0",
  /** Public GitHub repository (navbar + hero "GitHub" buttons). */
  githubUrl: clean(env.VITE_GITHUB_URL) || "https://github.com/MichaelLeHoang/LegitMate",
  /**
   * Chrome Web Store listing for the extension. Empty until published — the
   * "Add to Chrome" button then falls back to scrolling to the in-page demo.
   */
  chromeStoreUrl: clean(env.VITE_CHROME_STORE_URL),
  /** Optional footer legal links. Empty → rendered as inert text. */
  privacyUrl: clean(env.VITE_PRIVACY_URL),
  termsUrl: clean(env.VITE_TERMS_URL)
} as const;

/** In-page anchor used as the "Add to Chrome" fallback before the store listing exists. */
export const DEMO_ANCHOR = "#full-extension-demo";

/**
 * Props for the "Add to Chrome" links: open the store listing in a new tab when
 * configured, otherwise smooth-scroll to the in-page demo.
 */
export const installLinkProps = config.chromeStoreUrl
  ? { href: config.chromeStoreUrl, target: "_blank", rel: "noopener noreferrer" }
  : { href: DEMO_ANCHOR };
