# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LegitMate is a privacy-first Chrome MV3 extension that produces an **explainable** website risk score for the active tab, backed by a domain-only FastAPI reputation service. v0.1 is deliberately deterministic: no ML, no blocking overlay, no full-URL collection. Every risk verdict is the sum of individually attributed signals, never a black box.

## Monorepo layout

- `apps/extension` — Chrome MV3 extension (React 19 + TypeScript + Vite). An npm workspace.
- `apps/web-dashboard` — LegitMate landing/marketing web UI (React 19 + TypeScript + Vite + Tailwind v4). An npm workspace. Shares the "egg detective" visual language and the `MascotEgg` component with the extension; its on-page scan results are a local heuristic mock (`src/utils/analyzer.ts`) for demo only — the real scoring lives in the extension + `services/api`.
- `services/api` — FastAPI service for RDAP age + phishing-feed lookups. Separate Python project, not part of the npm workspace.
- `services/workers` — placeholder for planned background workers (no code yet).
- `ml/` — placeholder workspace for the post-v0.1 model (`datasets/`, `features/`, `training/`, `models/`; READMEs only). v0.1 has no ML.
- `docs/` — `privacy.md`, `scoring.md`, `threat-model.md`, `contributing.md`.
- `.agents/skills/` — bundled chrome-extension authoring reference skills (pinned via `skills-lock.json`); reference material, not application code.

## Commands

Extension (run from repo root):

```bash
npm install
npm run build              # tsc --noEmit && vite build -> apps/extension/dist
npm run dev:extension      # vite dev server
npm test                   # vitest run (all extension tests)
npm run typecheck          # tsc --noEmit
```

Web dashboard (run from repo root):

```bash
npm run dev:web            # vite dev server
npm run build:web          # tsc --noEmit && vite build -> apps/web-dashboard/dist
npm run typecheck:web      # tsc --noEmit
```

Run a single extension test:

```bash
npm test --workspace apps/extension -- src/scoring/scoring.test.ts
npm test --workspace apps/extension -- -t "name of test"
```

Backend (run from `services/api`):

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload    # serves on http://localhost:8000
pytest                           # all API tests
pytest tests/test_domain.py -k normalize   # single test / pattern
ruff check .                     # lint (line-length 100, py311 target)
```

Load the built extension from `apps/extension/dist` via Chrome's extensions page (Developer mode → Load unpacked).

## Architecture

### Analysis flow (the core path)

1. **Popup** (`src/popup/main.tsx`) sends `GET_CACHED_RESULT` on open and `CHECK_ACTIVE_TAB` on user action. It only renders; all logic is in the service worker.
2. **Service worker** (`src/background/serviceWorker.ts`) is the orchestrator. On `CHECK_ACTIVE_TAB` it runs local `analyzeUrl()`, then in parallel (a) programmatically injects the content script and requests page signals, and (b) calls the backend with the registrable domain only. It merges all three sources via `buildAnalysisResult()`, caches the result, and sets the toolbar badge.
3. **Content script** (`src/content/pageSignals.ts`) is injected on demand via `chrome.scripting.executeScript` — it is **not** declared in the manifest and never runs until the user checks a site. It returns compact findings (password/payment fields, cross-origin form actions, suspicious wording, missing contact/policy text), never raw page content.
4. **Backend** routes live in `services/api/app/routers/` (`domain_analysis.py` for `/v1/analyze/domain`, `reports.py` for `/v1/report`; `app/main.py` is a thin app factory that wires CORS, includes the routers, and defines `/v1/health`). The analyze route validates+normalizes the domain, runs RDAP (`app/rdap/client.py`) and feed (`app/feeds/repository.py`) lookups, and returns source-attributed `riskSignals` plus a `reputation` summary. The module-level `rdap_client`/`feed_repository` instances live in `app/routers/domain_analysis.py` (that is where tests monkeypatch them).

### Scoring model

All signals are `RiskSignal { id, title, description, severity, scoreImpact, source }`. `buildAnalysisResult` (`src/scoring/scoring.ts`) concatenates URL + page + backend signals, sums `scoreImpact` clamped to 100, and `classifyRisk` maps it: **≥60 high, ≥30 medium, <30 low, zero signals → unknown**. Confidence rises with the number of contributing sources. URL heuristics live in `src/scoring/urlFeatures.ts`; backend scoring mirrors this in `services/api/app/scoring/signals.py`.

The `RiskSignal` shape is **duplicated** across TypeScript (`src/scoring/types.ts`) and Python (`services/api/app/models.py`) and must stay in sync — there is no shared schema. Field names are camelCase on both sides (the Pydantic models intentionally use camelCase to match the wire format the extension consumes).

### Registrable-domain logic is also duplicated

`getRegistrableDomain`/`countSubdomains` (`src/utils/domain.ts`) and `_registrable_domain`/`normalize_domain` (`services/api/app/domain.py`) implement the same PSL-lite rule (a hardcoded `COMMON_SECOND_LEVEL_TLDS` set, not the real Public Suffix List). Changes to one usually need the other.

### Vite build wiring

`vite.config.ts` has three fixed entry points and a custom plugin that emits `manifest.json` into `dist`. The service worker and content script are mapped to exact output paths (`background/serviceWorker.js`, `content/pageSignals.js`) that the manifest and `executeScript` call depend on — keep these names aligned if you add or rename entry points.

## Invariants to preserve

- **Privacy boundary**: only the normalized registrable domain is ever sent to the backend — never full URLs, paths, query strings, or browsing history. `manifest.json` requests `activeTab`/`scripting`/`storage` and host permission for the API origin only; do not add `<all_urls>`.
- **Graceful degradation**: backend timeout (`CHECK_TIMEOUT_MS` in `src/config.ts`) or offline must fall back to a local-only result with a warning, never an error state. Page-signal collection failures return `null`, not a throw.
- **Explainability**: never surface a score without its contributing reasons; signals carry user-facing `title`/`description`.

## Notes

- `src/config.ts` hardcodes `API_BASE_URL = http://localhost:8000`; this is the only place to change for a deployed backend (and must be matched in `host_permissions`).
- The backend `POST /v1/report` endpoint exists but the extension currently stores feedback locally only (`storage/cache.ts`) and does not call it.
