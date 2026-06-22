# LegitMate Implementation Roadmap

## Product Positioning

LegitMate is a privacy-first, open-source browser extension that gives users an
explainable website risk score. It should not claim to replace built-in browser
protection or decide whether a site is absolutely safe. Its job is to show why a
site may be suspicious, especially for phishing pages, fake shops, impersonation
sites, suspicious login/payment pages, and scam-like offers.

The market already has browser-level protection and commercial extensions. The
project's advantage is transparency: every score is backed by visible signals,
confidence, and user-verifiable evidence. The default product stance remains
local-first, minimal-permission, and centralized review before any external
reporting.

Useful public references for the roadmap:

- APWG phishing trend reports: https://apwg.org/trendreports
- Google Safe Browsing: https://safebrowsing.google.com/
- Safe Browsing API overview: https://developers.google.com/safe-browsing/v4
- Chrome Web Store program policies: https://developer.chrome.com/docs/webstore/program-policies/policies
- Chrome extension permission guidance: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions

## Current State

- The Chrome MV3 extension uses a React/Vite popup, background service worker,
  local URL scoring, on-demand page-signal collection, cache/history storage,
  user preferences, and toolbar badge updates.
- The FastAPI backend supports domain-only analysis with RDAP and feed-derived
  reputation signals.
- Reports can include scam type, user-selected region, review-priority decision,
  and likely official destination ids.
- Region-based report routing currently supports the United States and Canada.
  It is queue-first: LegitMate collects reports centrally and uses region plus
  scan results to help reviewers choose the right destination later. The
  extension does not submit reports directly to agencies.
- Current preferences are `autoScanOnOpen`, `showBadge`, `reduceMotion`, and
  `reportRegion`.

## Phased Roadmap

### Phase 0: Baseline Audit And Documentation

- Keep `README.md`, `design.md`, `docs/privacy.md`, `docs/scoring.md`, and this
  roadmap aligned with implemented behavior.
- Verify core commands before release: `npm run typecheck`, `npm test`,
  `npm run build`, and `pytest` from `services/api`.
- Keep score language precise: internal `score` is a risk score where higher is
  worse; user-facing trust score is the inverse.

### Phase 1: v0.1 Public MVP Hardening

- Finish popup-first flows: score, risk level, reasons, confidence, copy report,
  report site, external scan, trusted feedback, and clear backend-offline state.
- Preserve narrow permissions: `activeTab`, `scripting`, `storage`, and API host
  permissions only.
- Keep deterministic scoring first. No ML, background browsing surveillance, or
  aggressive blocking in v0.1.
- Add only source-attributed reputation data and document API terms/rate limits.

### Phase 2: Regional Report Collection

- Maintain a destination registry for supported regions and scam types.
- Default `reportRegion` to `US`; allow manual switching to `CA`.
- Show a confirmation modal before the report is submitted to LegitMate's
  central queue.
- Mark medium/high-risk reports as `review_priority` when `score >= 30` or
  `riskLevel` is `medium`/`high`.
- Mark low/unknown reports as `standard_review`, but still collect them for
  review and false-negative analysis.
- Keep direct external submission disabled until an agency has a verified API or
  documented intake flow that permits automated submissions and the internal
  review process has approved forwarding.

Initial destinations:

- US: FTC ReportFraud, FBI IC3, FTC phishing reporting guidance.
- Canada: Canadian Anti-Fraud Centre, Canadian Centre for Cyber Security.

Official references:

- FTC phishing reporting guidance: https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams
- FTC ReportFraud: https://reportfraud.ftc.gov/
- FBI IC3: https://www.ic3.gov/
- Canadian Anti-Fraud Centre: https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm
- Canadian Centre for Cyber Security: https://www.cyber.gc.ca/en/incident-management

### Phase 3: Better Scam Detection

- Expand URL/domain/page signals: suspicious TLDs, URL shorteners, encoded
  characters, `@` symbol, punycode, brand impersonation, newly issued
  certificates, redirects, fake-shop cues, missing contact/return policy,
  payment/login forms, crypto/investment language, and fake urgency.
- Improve page-signal collection while preserving the default rule that raw page
  content and form values are not sent to the backend.
- Add concise education cards explaining the highest-impact risk signals.

### Phase 4: Opt-In High-Risk Warning Layer

- Add warning behavior only as explicit opt-in.
- Default threshold: warn only for high risk; optionally allow medium risk.
- Future preferences: `autoWarnEnabled`, `autoWarnRiskThreshold`, and
  `autoWarnCooldownMinutes`.
- Prefer an in-page banner or browser notification. Do not assume the toolbar
  popup can always appear automatically.
- Update permissions, privacy docs, and Chrome Web Store disclosures before any
  broader host access or background monitoring.

### Phase 5: Data, Community, And Evaluation

- Add false-positive and false-negative workflows.
- Treat community reports as signals, not truth, and add abuse controls.
- Track evaluation metrics: false positive rate, false negative rate, detection
  latency, feed overlap, and newly observed suspicious domains missed by feeds.
- Publish scoring docs that map every score impact to a stable signal id.

### Phase 6: Explainable ML, Later

- Start with simple explainable models only after deterministic data and labels
  are reliable.
- Candidate models: Logistic Regression, Random Forest, and LightGBM.
- Candidate features: URL lexical features, domain metadata, threat-feed labels,
  benign top-site lists, and page-level features.
- Later options: ONNX/browser inference, TensorFlow.js, MobileBERT-style local
  classifier, and LLM-generated explanations.
- Do not make LLM-only detection authoritative.

### Phase 7: Long-Term Product

- Add a public web dashboard, threat database, maintainer review flow, developer
  API, and suspicious URL submission page.
- Explore email-link scanning, QR-code scam checking, fake-shop detection, brand
  impersonation monitoring, enterprise allow/block lists, and installed-extension
  safety scanning.
- Productionize backend deployment, CORS, feed ingestion jobs, package pipeline,
  and Chrome Web Store release assets.

## Acceptance Checks

- Safe domain: low or unknown risk with no alarming copy.
- Suspicious domain: medium/high risk with source-attributed reasons.
- Backend unavailable: local-only result with warning, not a hard failure.
- Report region: US/Canada destinations change with the setting.
- Report collection: all reports are submitted to the central review queue when
  the API is available.
- Report priority: medium/high risk is marked `review_priority`; low/unknown
  risk is marked `standard_review`.
- Privacy: no geolocation permission, no browsing-history upload, and no full
  URL cloud checks by default.
