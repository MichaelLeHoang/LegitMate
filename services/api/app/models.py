from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class DomainAnalysisRequest(BaseModel):
    domain: str = Field(min_length=1, max_length=253)
    clientVersion: str | None = Field(default=None, max_length=32)


class RiskSignal(BaseModel):
    id: str
    title: str
    description: str
    severity: Literal["info", "low", "medium", "high"]
    scoreImpact: int
    source: Literal["url", "page", "reputation", "rdap", "system"]


class ReputationFinding(BaseModel):
    source: str
    status: Literal["match", "clear", "unknown"]
    description: str


class ReputationSummary(BaseModel):
    feedMatches: list[ReputationFinding]
    domainAgeDays: int | None
    rdapAvailable: bool


class DomainAnalysisResponse(BaseModel):
    domain: str
    riskSignals: list[RiskSignal]
    reputation: ReputationSummary
    checkedAt: datetime


class ReportRequest(BaseModel):
    domain: str | None = Field(default=None, max_length=253)
    url: str = Field(min_length=1, max_length=4096)
    verdict: Literal["safe", "unsafe"]
    result: dict


class ReportResponse(BaseModel):
    reportId: str
