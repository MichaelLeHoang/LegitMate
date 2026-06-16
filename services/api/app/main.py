from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.domain import DomainValidationError, normalize_domain
from app.models import (
    DomainAnalysisRequest,
    DomainAnalysisResponse,
    ReportRequest,
    ReportResponse,
    ReputationSummary,
)
from app.reputation.feeds import FeedRepository
from app.reputation.rdap import RdapClient
from app.scoring import signals_from_reputation

app = FastAPI(title="LegitMate API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"chrome-extension://.*|http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?",
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

rdap_client = RdapClient()
feed_repository = FeedRepository()


@app.get("/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/analyze/domain", response_model=DomainAnalysisResponse)
async def analyze_domain(payload: DomainAnalysisRequest) -> DomainAnalysisResponse:
    try:
        domain = normalize_domain(payload.domain)
    except DomainValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    rdap_result = await rdap_client.lookup_domain(domain)
    feed_findings = await feed_repository.check_domain(domain)

    return DomainAnalysisResponse(
        domain=domain,
        riskSignals=signals_from_reputation(feed_findings, rdap_result),
        reputation=ReputationSummary(
            feedMatches=feed_findings,
            domainAgeDays=rdap_result.domain_age_days,
            rdapAvailable=rdap_result.available,
        ),
        checkedAt=datetime.now(UTC),
    )


@app.post("/v1/report", response_model=ReportResponse)
async def report_site(payload: ReportRequest) -> ReportResponse:
    if payload.domain:
        try:
            normalize_domain(payload.domain)
        except DomainValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ReportResponse(reportId=str(uuid.uuid4()))
