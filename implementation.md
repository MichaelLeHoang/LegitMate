# LegitMate v0.1 Implementation Plan

  ## Summary

  Build a privacy-first, open-source Chrome extension that analyzes the current active site and returns an explainable website risk score. v0.1 will focus on deterministic URL/domain/page signals, domain-only backend checks, and clear user-facing explanations rather than AI or aggressive
  blocking.

  Use a monorepo:

  apps/extension        # Chrome MV3 extension, React, TypeScript, Vite
  services/api          # FastAPI backend for RDAP/reputation/feed aggregation
  docs                  # privacy, scoring, threat model, contribution docs

  ## Key Changes

  - Extension:
      - Manifest V3 Chrome extension using activeTab, storage, and minimal host permissions.
      - Popup UI with current-site score, risk level, reasons, confidence, and actions.
      - Background service worker coordinates tab lookup, scoring requests, cache reads/writes, and badge updates.
      - Programmatic content-script injection only when the user checks a page.
      - Local heuristic engine for URL and lightweight page signals.

  - Backend:
      - FastAPI service with domain-only APIs by default.
      - Endpoints:
          - POST /v1/analyze/domain
          - POST /v1/report
          - GET /v1/health

      - Aggregate RDAP/domain age, phishing-feed matches, and cached reputation metadata.
      - No full URL collection by default; full URL scans are reserved for explicit future opt-in.

  - Scoring:
      - Return a structured result:
          - score: 0-100
          - riskLevel: low | medium | high | unknown
          - confidence: low | medium | high
          - reasons: explainable positive/negative signals
          - checkedAt
          - dataSources

      - Initial signals:
          - IP-address URL
          - punycode / xn--
          - suspicious keywords
          - excessive URL length
          - many subdomains
          - brand-like domain mismatch
          - login/payment form detected
          - form submits to another origin
          - domain age from RDAP
          - known phishing-feed match

      - Scoring logic lives in open TypeScript/Python modules and is documented in docs/scoring.md.

  - UI:
      - Popup-first interface, not a landing page.
      - States: idle, checking, low/medium/high/unknown, backend unavailable, unsupported page.
      - Actions:
          - Check current site
          - Copy safety report
          - Report this site
          - Open external scan
          - Mark as safe/unsafe feedback

      - Badge shows compact status: LOW, MED, HIGH, or ?.

  ## Implementation Phases

  1. Scaffold monorepo
      - Add package manager config, TypeScript/Vite extension app, FastAPI service, shared lint/test scripts, and README setup instructions.

  2. Build extension shell
      - Add MV3 manifest, popup entrypoint, background service worker, Chrome API adapter, typed message contracts, and storage helpers.

  3. Implement local scoring
      - Build URL parser, heuristic rules, score aggregation, reason formatting, and unit tests.
      - Cache the latest result per normalized hostname using chrome.storage.session or chrome.storage.local with TTL.

  4. Add content checks
      - Inject content script on user action.
      - Detect login/payment forms, external form actions, password fields, suspicious page text, and basic contact-policy absence.
      - Return only compact findings to the service worker.

  5. Add FastAPI reputation service
      - Implement POST /v1/analyze/domain.
      - Normalize hostnames server-side.
      - Add RDAP lookup with cache.
      - Add feed lookup abstraction for PhishTank/OpenPhish-style data.
      - Return source-specific findings, not a hidden black-box verdict.

  6. Connect extension to backend
      - Extension sends normalized domain only.
      - Merge backend findings with local/page findings.
      - Render combined score and explanations.
      - Handle timeout/offline states by showing local-only results.

  7. Add docs
      - docs/privacy.md: what is collected, what is not collected, cloud-check behavior.
      - docs/scoring.md: all v0.1 rules, weights, examples, and limitations.
      - docs/threat-model.md: extension trust boundaries and abuse risks.
      - CONTRIBUTING.md: false positive/false negative reporting process.

  ## Public Interfaces

  - Extension message types:
      - CHECK_ACTIVE_TAB
      - GET_CACHED_RESULT
      - REPORT_SITE
      - COPY_REPORT_DATA

  - Backend request:

  {
    "domain": "example.com",
    "clientVersion": "0.1.0"
  }

  - Backend response:

  {
    "domain": "example.com",
    "riskSignals": [],
    "reputation": {
      "feedMatches": [],
      "domainAgeDays": null,
      "rdapAvailable": false
    },
    "checkedAt": "ISO-8601 timestamp"
  }

  ## Test Plan

  - Unit tests:
      - URL normalization and parsing.
      - Suspicious keyword detection.
      - backend response validation.
      - FastAPI domain validation and RDAP/feed adapter behavior.

  - Extension tests:
      - Verify backend failure falls back to local-only scoring.
      - Verify no full URL is sent in default domain-only mode.

  - Manual acceptance checks:
      - paypal.com shows low/unknown risk with limited reasons.
      - secure.paypal.com.example.test shows impersonation/subdomain risk.
      - IP-address URL shows high-risk reason.
      - page with password form on suspicious domain includes form-related reason.
      - backend offline still produces a local report.
      - extension permissions do not request <all_urls> by default.
  - v0.1 targets Chrome MV3 first.
  - Backend stack is FastAPI.
  - Default privacy mode sends only normalized domain names to the backend.
  - No ML model, blocking overlay, enterprise dashboard, or community moderation workflow in v0.1.
  - Full URL scans, warning overlays, dashboard, and ML are planned for later versions after the scoring baseline and privacy docs are stable.