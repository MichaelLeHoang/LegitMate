# Threat Model

LegitMate is a browser extension, so the extension itself is part of the user's
trusted computing base.

Primary risks:

- collecting more browsing data than needed
- sending full URLs when domain-only checks are enough
- producing unexplained false positives
- missing phishing sites that are not in feeds yet
- letting community reports become an untrusted source of truth

v0.1 mitigations:

- use `activeTab` instead of broad default site access
- inject content checks only after a user action
- send domain-only backend requests by default
- show reasons and confidence instead of absolute claims
- treat feed and community signals as explainable inputs, not final verdicts
