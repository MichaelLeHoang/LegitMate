from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

from app.models import ReputationFinding


@dataclass(frozen=True)
class FeedMatch:
    source: str
    value: str


class FeedRepository:
    def __init__(self, feed_files: list[Path] | None = None) -> None:
        configured_files = feed_files if feed_files is not None else _files_from_env()
        self._entries = _load_entries(configured_files)

    async def check_domain(self, domain: str) -> list[ReputationFinding]:
        matches = [
            entry
            for entry in self._entries
            if entry.value == domain or entry.value.endswith(f".{domain}") or domain.endswith(f".{entry.value}")
        ]
        if not matches:
            return [
                ReputationFinding(
                    source="local-feeds",
                    status="unknown",
                    description="No configured local feed match."
                )
            ]
        return [
            ReputationFinding(
                source=match.source,
                status="match",
                description=f"Domain matched configured phishing feed entry: {match.value}."
            )
            for match in matches[:5]
        ]


def _files_from_env() -> list[Path]:
    raw_value = os.getenv("LEGITMATE_PHISHING_FEED_FILES", "")
    return [Path(part) for part in raw_value.split(",") if part.strip()]


def _load_entries(feed_files: list[Path]) -> list[FeedMatch]:
    entries: list[FeedMatch] = []
    for feed_file in feed_files:
        if not feed_file.exists() or not feed_file.is_file():
            continue
        for line in feed_file.read_text(encoding="utf-8").splitlines():
            value = _normalize_feed_line(line)
            if value:
                entries.append(FeedMatch(source=feed_file.name, value=value))
    return entries


def _normalize_feed_line(line: str) -> str | None:
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
        return None
    parsed = urlparse(stripped if "://" in stripped else f"https://{stripped}")
    host = parsed.hostname
    return host.lower().rstrip(".") if host else None
