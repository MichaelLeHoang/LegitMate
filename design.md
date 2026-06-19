# LegitMate Design

## Purpose

LegitMate is a privacy-first Chrome extension that gives users an explainable
risk assessment for the active website. The product goal is not to declare
whether a site is absolutely safe or malicious. The goal is to surface concrete,
auditable signals that help users slow down before entering credentials,
payment details, or recovery phrases on suspicious pages.

v0.1 is intentionally deterministic. It uses local URL analysis, lightweight
page checks, and domain-only backend reputation checks. It does not use ML,
blocking overlays, full URL cloud scans, or background browsing-history
collection.

## System Overview

The repository is a monorepo with four main areas:

- `apps/extension`: Manifest V3 Chrome extension built with React, TypeScript,
  and Vite.
- `services/api`: FastAPI backend for RDAP, phishing-feed, and reputation
  signals.
- `docs`: focused privacy, scoring, threat-model, and contribution notes.
- `apps/web-dashboard`, `services/workers`, and `ml`: planned future
  workspaces that are currently placeholders or scaffolding.

At runtime, the popup asks the background service worker to check the current
active tab. The service worker gathers local URL signals, optionally injects a
content script for compact page signals, requests domain reputation from the
backend, then merges all signals into one result.

```text
Popup UI
  -> Background service worker
       -> Local URL scorer
       -> Programmatic content script
       -> Domain-only FastAPI request
  <- Combined score, reasons, confidence, warnings
```

## Browser Extension

The extension uses Manifest V3 and keeps permissions narrow:

- `activeTab` lets the extension inspect the current page after user action.
- `scripting` lets the service worker inject `content/pageSignals.js` on demand.
- `storage` supports session cache, local history, feedback, and preferences.
- `host_permissions` are limited to localhost during development for API calls.

The background service worker is the orchestration layer. It handles typed
messages from the popup, queries the active tab, runs URL analysis, collects page
signals, calls the backend, writes cache/history, and updates the action badge.
Popup components remain presentation-focused.

The content script is not declared as a persistent content script in the
manifest. It is injected only when the user starts a check. It returns a compact
summary such as form counts, password fields, payment fields, external form
origins, suspicious wording matches, and basic contact or policy hints. It does
not send page contents, form values, cookies, or browsing history to the
backend.

## Backend API

The backend is a FastAPI service under `services/api`. It exposes:

- `GET /v1/health`
- `POST /v1/analyze/domain`
- `POST /v1/report`

The domain analysis route accepts a normalized domain request, validates it
server-side, performs RDAP and feed lookups, then returns source-attributed
`riskSignals` plus a reputation summary. The extension sends only the domain,
not the full URL, path, query string, page text, cookies, or tab history.

During development, `make dev` starts both the API and extension dev server. It
selects available ports starting from the preferred `API_PORT` and
`EXTENSION_PORT` values and passes the selected API URL into the extension via
`VITE_API_BASE_URL`.

## Scoring Model

All scoring is signal-based. A signal has a stable id, user-facing title and
description, severity, score impact, and source. The final score is the sum of
positive risk impacts, capped at `100`.

Risk levels are:

- `unknown`: no useful signals
- `low`: score below `30`
- `medium`: score from `30` to `59`
- `high`: score `60` or higher

Confidence is based on how many signal sources contributed. Local-only checks
usually produce lower confidence than checks that include both page and backend
signals. Backend errors are warnings, not hard failures; the extension still
returns a local result.

Detailed scoring rules live in `docs/scoring.md`.

## Privacy Boundaries

The privacy baseline is part of the architecture:

- Checks happen for the active tab only.
- Page checks require a user-triggered action.
- Backend checks send only the normalized domain.
- Full URLs, page contents, form values, cookies, and browsing history are not
  sent to the backend by default.
- Any future feature that changes this must be explicit opt-in and update the
  privacy documentation.

Local storage is split by purpose:

- `chrome.storage.session` stores short-lived cached analysis results.
- `chrome.storage.local` stores preferences, recent check history, and local
  feedback records.

Detailed privacy notes live in `docs/privacy.md`; risk analysis lives in
`docs/threat-model.md`.

## Data Flow

1. The user opens the popup and requests a check.
2. The popup sends `CHECK_ACTIVE_TAB` to the service worker.
3. The service worker reads the active tab URL.
4. Local URL analysis extracts hostname, registrable domain, warnings, and URL
   risk signals.
5. If the tab and hostname are valid, the service worker injects the page-signal
   script and asks it for compact page findings.
6. If a registrable domain is available, the service worker calls
   `POST /v1/analyze/domain`.
7. URL, page, and backend signals are merged into one `AnalysisResult`.
8. The result is cached, added to local history, rendered in the popup, and used
   to update the extension badge.

If page-signal collection fails, it returns `null`. If backend reputation fails
or times out, the result includes a warning and falls back to local-only mode.

## Shared Contracts

The TypeScript and Python models intentionally mirror the API wire format, but
there is no generated shared schema yet. These contracts must stay aligned:

- `RiskSignal`
- `DomainAnalysisRequest`
- `DomainAnalysisResponse`
- `ReputationSummary`
- registrable-domain normalization behavior

The registrable-domain logic is duplicated between the extension and backend
with a small public-suffix-style rule set. Changes to one side should usually be
made to the other side in the same patch.

## Non-Goals for v0.1

v0.1 does not include:

- ML-based classification
- automatic blocking or interstitial warning pages
- broad host permissions such as `<all_urls>`
- background crawling or browsing-history scanning
- full URL reputation scans by default
- community reports as a source of truth
- production dashboard or worker pipeline

These may be revisited later after the privacy and scoring baseline is stable.

## Operational Notes

Primary local commands:

```bash
make dev
make build
make test
make typecheck
make lint-api
```

The built extension is loaded from `apps/extension/dist` in Chrome's extension
page. Backend CORS allows Chrome extension origins and local development origins.

## Design Principles

- Prefer explainable signals over opaque verdicts.
- Prefer domain-only cloud checks over full URL collection.
- Prefer user-triggered analysis over passive background monitoring.
- Prefer graceful degradation over hard error states.
- Prefer narrow permissions and explicit future opt-ins.
