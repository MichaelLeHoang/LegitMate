from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime

import httpx


@dataclass(frozen=True)
class RdapResult:
    domain_age_days: int | None
    available: bool


class RdapClient:
    def __init__(self, timeout_seconds: float = 3.0) -> None:
        self._timeout_seconds = timeout_seconds
        self._cache: dict[str, RdapResult] = {}

    async def lookup_domain(self, domain: str) -> RdapResult:
        cached = self._cache.get(domain)
        if cached:
            return cached

        try:
            async with httpx.AsyncClient(timeout=self._timeout_seconds) as client:
                response = await client.get(f"https://rdap.org/domain/{domain}")
            if response.status_code >= 400:
                result = RdapResult(domain_age_days=None, available=False)
            else:
                result = _parse_rdap(response.json())
        except (httpx.HTTPError, ValueError):
            result = RdapResult(domain_age_days=None, available=False)

        self._cache[domain] = result
        return result


def _parse_rdap(payload: dict) -> RdapResult:
    registration_date = None
    for event in payload.get("events", []):
        action = str(event.get("eventAction", "")).lower()
        if action in {"registration", "registered"} and event.get("eventDate"):
            registration_date = _parse_datetime(event["eventDate"])
            break

    if not registration_date:
        return RdapResult(domain_age_days=None, available=True)

    now = datetime.now(UTC)
    return RdapResult(domain_age_days=max(0, (now - registration_date).days), available=True)


def _parse_datetime(value: str) -> datetime | None:
    try:
        normalized = value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=UTC)
        return parsed.astimezone(UTC)
    except ValueError:
        return None
