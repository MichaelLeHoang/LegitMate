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
    scamType: Literal["phishing", "fake_shop", "crypto", "impersonation", "other"] | None = None
    region: Literal["US", "CA"] | None = None
    routingDecision: Literal["review_priority", "standard_review"] | None = None
    destinationIds: list[str] = Field(default_factory=list)
    result: dict | None = None


class ReportDestination(BaseModel):
    id: str
    region: Literal["US", "CA"]
    label: str
    agency: str
    url: str
    capability: Literal["manual_portal", "guidance"]
    supportedScamTypes: list[Literal["phishing", "fake_shop", "crypto", "impersonation", "other"]]


class ReportResponse(BaseModel):
    reportId: str
    routingDecision: Literal["review_priority", "standard_review"]
    destinations: list[ReportDestination]
