from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException

from app.domain import DomainValidationError, normalize_domain
from app.feeds.repository import FeedRepository
from app.models import DomainAnalysisRequest, DomainAnalysisResponse, ReputationSummary
from app.rdap.client import RdapClient
from app.scoring.signals import signals_from_reputation

router = APIRouter()

rdap_client = RdapClient()
feed_repository = FeedRepository()


@router.post("/v1/analyze/domain", response_model=DomainAnalysisResponse)
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
