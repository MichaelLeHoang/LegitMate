# web-dashboard

The LegitMate marketing/landing web UI — React 19 + TypeScript + Vite + Tailwind v4.
It introduces the brand's playful **"egg detective"** identity (Det-Egg-Tive Mate)
and includes an interactive in-page preview of the extension popup so visitors can
feel the product before installing.

It shares its visual language and the `MascotEgg` component with `apps/extension`.
The on-page scan results here are produced by a **local heuristic mock**
(`src/utils/analyzer.ts`) for demonstration only — the real, source-attributed
scoring lives in the extension + `services/api`.

## Commands

Run from the repo root:

```bash
npm install
npm run dev:web        # vite dev server (defaults to http://localhost:4300)
npm run build:web      # tsc --noEmit && vite build -> apps/web-dashboard/dist
npm run typecheck:web  # tsc --noEmit
```

Or from this directory: `npm run dev` / `npm run build` / `npm run preview`.
Via the Makefile: `make dev-web` (auto-bumps off a busy port and prints the URL),
or `make dev` to run the API + extension + web together.

## Configuration

Site settings are centralized in `src/config.ts`, fed by Vite env vars. Copy
`.env.example` to `.env` and edit (only `VITE_`-prefixed vars reach the bundle;
`.env` is gitignored):

| Var | Purpose | Default / fallback |
| --- | --- | --- |
| `VITE_APP_VERSION` | Version in the hero "New v…" tag | `2.0` |
| `VITE_SCORING_VERSION` | Scoring model/version label in the extension preview | `1.2` |
| `VITE_LEGIT_VERSION` | Trust/integrity label in the privacy section | `1.2` |
| `VITE_GITHUB_URL` | GitHub repo link (navbar + hero) | `github.com/MichaelLeHoang/LegitMate` |
| `VITE_CHROME_STORE_URL` | "Add to Chrome" destination once published | empty → install modal (see below) |
| `VITE_EXTENSION_DOWNLOAD_URL` | Pre-store download for "Add to Chrome" | empty → `/legitmate-extension.zip` |
| `VITE_PRIVACY_URL` | Footer "Privacy Policy" link | empty → inert text |
| `VITE_TERMS_URL` | Footer "Terms of Service" link | empty → inert text |

## Distributing the extension (pre-store)

There's no real one-click "Add to Chrome" until the extension is on the Chrome Web
Store. Until then, the site hands users a packaged build to **load unpacked**:

```bash
npm run dev:web             # creates the zip if missing, then starts Vite
npm run build:web           # refreshes the zip, then builds dist for deployment
```

Clicking **"Add to Chrome"** then opens an install modal: a **Download (.zip)** button
plus the four `chrome://extensions` → Developer mode → Load unpacked steps. The UI
works immediately on local heuristics; cloud reputation checks activate once the
backend is hosted (point the extension's `config.ts` / `VITE_API_BASE_URL` at it).

The zip is **generated, not committed** (gitignored). The dashboard `predev` and
`prebuild` scripts create `public/legitmate-extension.zip` automatically, so Vercel
will include it when the build command is `npm run build:web` from the repo root
or `npm run build` from `apps/web-dashboard`. To host it elsewhere (e.g. a GitHub
release asset), set `VITE_EXTENSION_DOWNLOAD_URL` to that URL.

**When the store listing is live:** set `VITE_CHROME_STORE_URL` and every "Add to
Chrome" button switches from the install modal to opening the listing — no code change.

---

## Design language

LegitMate turns an intimidating security topic into something approachable. The
tone is **warm, friendly, and explainable** — a cartoon egg detective with a
deerstalker hat and magnifying glass, never a scary red wall of text.

### Principles

1. **Explainable, never a black box.** Every verdict is shown with the plain-English
   reasons behind it (the "Det-egg-tive Log"). The UI always pairs a score with *why*.
2. **Privacy-first framing.** Copy and the dedicated privacy section emphasize that
   only the registrable domain is checked — no full URLs, paths, or browsing history.
3. **Playful but legible.** Rounded shapes, thick `#2D2A26` outlines, and the mascot
   keep it fun; high contrast and clear hierarchy keep it readable.
4. **State communicated by character.** Risk is expressed first through the mascot's
   expression and color, then reinforced by score, badge, and text — redundant cues
   so the meaning lands at a glance.
5. **Show, don't tell.** The page embeds a live, interactive popup mock instead of
   static screenshots, so the explainability story is felt directly.

### Design tokens

Defined in `src/index.css` via Tailwind v4 `@theme`:

**Color**

| Token | Hex | Role |
| --- | --- | --- |
| `bg-warm` | `#FFF8E7` | App background (warm cream) |
| `brand-orange` | `#FF9F1C` | Primary action / accent |
| `brand-deep` | `#E86A17` | Hover / pressed accent, "cracked" state |
| `brand-yellow` | `#FFD166` | Highlights, badges |
| `brand-green` | `#4CAF50` | Safe / "Good Egg" |
| `brand-red` | `#EF4444` | Danger / "Rotten Egg" |
| `brand-dark` | `#2D2A26` | Text + the signature outline stroke |
| `brand-white` | `#FFFFFF` | Cards / surfaces |
| `brand-border` | `#F3D9A4` | Soft card borders, dividers |

**Typography**

| Token | Family | Used for |
| --- | --- | --- |
| `font-display` | Space Grotesk | Headings, mascot state labels |
| `font-sans` | Nunito | Body copy |
| `font-mono` | JetBrains Mono | Domains, scores, "case file" / technical accents |

> Web fonts load from Google Fonts via `@import` in `index.css` (acceptable for a
> public site). The **extension** popup deliberately drops the remote import and
> falls back to the system stack to honor its privacy/CSP boundary.

**Motion** — `animate-bounce-subtle` (gentle float) and `animate-pulse-slow`
(soft breathing), plus Tailwind built-ins (`animate-bounce`, `animate-ping`) for
attention cues. Keep motion subtle and slow.

---

## The egg rating system

A single trust score (0–100, **higher = safer**) maps to an egg state. Thresholds
live in `getEggRating` (`src/utils/analyzer.ts`); the mascot art lives in
`MascotEgg.tsx`. Note this is the inverse of the extension/backend *risk* score
(higher = riskier) — the extension popup converts between them in `eggRating.ts`.

| Rating | Score | Color | Mascot expression |
| --- | --- | --- | --- |
| `GOOD` | ≥ 80 | green | happy arched eyes, blush, smile |
| `CAREFUL` | 50–79 | orange | focused/alert eyes, neutral mouth |
| `CRACKED` | 25–49 | deep orange | worried brows, sweat bead, shell cracks |
| `ROTTEN` | < 25 | red | `x_x` eyes, mold spots, no magnifier |
| `LOADING` | — | orange | spinning spiral glasses (scanning) |
| `UNKNOWN` | — | dark | quizzical look + floating "?" |

The mascot's constant identity — deerstalker hat, magnifying glass, trench-coat
collar, gold badge — stays the same across states; only expression, color glow,
and cracks/spots change.

---

## Components

| File | Responsibility |
| --- | --- |
| `src/App.tsx` | Root layout. Hosts the landing page, the auto-dismissing "interactive workspace" toast, and a floating launcher that overlays the live `ChromePopup` preview on top of any viewport. Owns the shared `currentUrl` / scan state. |
| `src/components/LandingPage.tsx` | The full marketing page (see sections below). Drives demos through the shared scan state. |
| `src/components/ChromePopup.tsx` | A faithful **emulator** of the extension popup (360×560), tabs for Shield / History / Report / Settings. Visual source of truth that was ported into `apps/extension`. Here it runs on the mock analyzer. |
| `src/components/MascotEgg.tsx` | The egg-detective SVG mascot. Pure, prop-driven (`rating`, `size`). **Shared verbatim with the extension.** |
| `src/utils/analyzer.ts` | Demo-only heuristic scorer: curated exact-match domains plus rules (TLD risk, spam keywords, look-alike/homograph patterns, subdomain depth) → `ScanResult`. |
| `src/types.ts` | `EggRating`, `ScanResult`, `SearchHistoryItem`. |

### Landing page sections (top → bottom)

1. **Navbar** — brand lockup + install CTA.
2. **Hero** — headline + the showcase mascot reacting live to the current demo state.
3. **Interactive multi-view demo** — a playground controller wired to a browser-chrome
   mock wrapping the real `ChromePopup`.
4. **URL Checker demo** — type/select a domain and watch the verdict + reasons update.
5. **How it works** — three steps: *Auto Scan on Load → Playful Mascot Alerts → Unscramble with Clarity*.
6. **Feature grid** — six capability cards.
7. **Privacy / trust** — the domain-only, no-history commitment.
8. **Footer** — links + newsletter CTA.

A floating **"Case Dossier" report modal** (typewriter case-file styling) can overlay
the page to show a full verdict breakdown for the selected result.

---

## Relationship to the extension

- `MascotEgg.tsx` is shared **identically** — keep the two copies in sync.
- `ChromePopup.tsx` here is the **design reference**; the production popup lives at
  `apps/extension/src/popup/` and is wired to real service-worker data, not the mock.
- Trust score (this app) vs. risk score (extension/backend) are inverses; see
  `apps/extension/src/popup/eggRating.ts` for the conversion and shared color/label tones.
