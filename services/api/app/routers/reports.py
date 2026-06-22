from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException

from app.domain import DomainValidationError, normalize_domain
from app.models import ReportRequest, ReportResponse
from app.reporting import destinations_for, routing_decision_for

router = APIRouter()


@router.post("/v1/report", response_model=ReportResponse)
async def report_site(payload: ReportRequest) -> ReportResponse:
    if payload.domain:
        try:
            normalize_domain(payload.domain)
        except DomainValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ReportResponse(
        reportId=str(uuid.uuid4()),
        routingDecision=routing_decision_for(payload.result),
        destinations=destinations_for(payload.region, payload.scamType),
    )
