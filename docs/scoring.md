# Scoring

LegitMate uses explainable signals. The score is a risk score from `0` to `100`;
higher means more suspicious.

Risk levels:

- `low`: score below 30
- `medium`: score from 30 to 59
- `high`: score 60 or higher
- `unknown`: not enough data to make a useful judgment

Initial v0.1 signals include:

- IP address used instead of a domain
- punycode or encoded URL components
- suspicious keywords such as `verify`, `login`, `wallet`, `claim`, or `gift`
- unusually long URLs
- many subdomains
- brand-like domains that are not the brand's known domain
- login or payment forms on the page
- forms submitting to a different origin
- newly registered domains from RDAP
- phishing-feed matches from configured backend feeds

Scores are intentionally conservative. LegitMate should explain why a site looks
risky without claiming that any automated result is final truth.
