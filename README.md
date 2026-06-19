# LegitMate

LegitMate is a privacy-first Chrome extension that gives users an explainable
website risk score for the current active site. The project focuses on
transparent URL, domain, reputation, and page-level signals instead of claiming
absolute scam detection.

## Apps

- `apps/extension` - Manifest V3 Chrome extension built with React, TypeScript,
  and Vite.
- `apps/web-dashboard` - Placeholder for the future web dashboard app.
- `services/api` - FastAPI service for domain-only reputation and RDAP checks.
- `services/workers` - Placeholder for background workers.
- `ml` - Dataset, feature, training, and model workspace.
- `docs` - Privacy, scoring, threat-model, and contribution notes.

## Quick Start

```bash
npm install
npm run build
```

Run the extension during development:

```bash
npm run dev:extension
```

Run the API:

```bash
cd services/api
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Load the extension from `apps/extension/dist` in Chrome's extensions page after
building it.

## Privacy Baseline

LegitMate analyzes only the current active tab when the user asks it to check a
site. By default, cloud reputation checks send only the normalized domain name to
the API, not full URLs or browsing history.
