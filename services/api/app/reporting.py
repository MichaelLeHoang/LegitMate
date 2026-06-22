from __future__ import annotations

from typing import Literal

ReportRegion = Literal["US", "CA"]
ScamType = Literal["phishing", "fake_shop", "crypto", "impersonation", "other"]
ReportRoutingDecision = Literal["review_priority", "standard_review"]


DESTINATIONS = [
    {
        "id": "us-ftc-reportfraud",
        "region": "US",
        "label": "ReportFraud.ftc.gov",
        "agency": "Federal Trade Commission",
        "url": "https://reportfraud.ftc.gov/",
        "capability": "manual_portal",
        "supportedScamTypes": ["phishing", "fake_shop", "crypto", "impersonation", "other"],
    },
    {
        "id": "us-ic3",
        "region": "US",
        "label": "Internet Crime Complaint Center",
        "agency": "FBI IC3",
        "url": "https://www.ic3.gov/",
        "capability": "manual_portal",
        "supportedScamTypes": ["phishing", "fake_shop", "crypto", "impersonation", "other"],
    },
    {
        "id": "us-ftc-phishing-guidance",
        "region": "US",
        "label": "FTC phishing reporting guidance",
        "agency": "Federal Trade Commission",
        "url": "https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams#how-to-report-phishing",
        "capability": "guidance",
        "supportedScamTypes": ["phishing", "impersonation"],
    },
    {
        "id": "ca-cafc",
        "region": "CA",
        "label": "Report fraud and cybercrime",
        "agency": "Canadian Anti-Fraud Centre",
        "url": "https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm",
        "capability": "manual_portal",
        "supportedScamTypes": ["phishing", "fake_shop", "crypto", "impersonation", "other"],
    },
    {
        "id": "ca-cyber-centre",
        "region": "CA",
        "label": "Report a cyber incident",
        "agency": "Canadian Centre for Cyber Security",
        "url": "https://www.cyber.gc.ca/en/incident-management",
        "capability": "guidance",
        "supportedScamTypes": ["phishing", "impersonation", "other"],
    },
]


def destinations_for(region: ReportRegion | None, scam_type: ScamType | None) -> list[dict]:
    selected_region = region or "US"
    selected_scam_type = scam_type or "other"
    return [
        destination
        for destination in DESTINATIONS
        if destination["region"] == selected_region
        and (
            selected_scam_type in destination["supportedScamTypes"]
            or "other" in destination["supportedScamTypes"]
        )
    ]


def routing_decision_for(result: dict | None) -> ReportRoutingDecision:
    if not result:
        return "standard_review"

    score = result.get("score")
    risk_level = result.get("riskLevel")
    if risk_level in {"medium", "high"}:
        return "review_priority"
    if isinstance(score, int) and score >= 30:
        return "review_priority"
    return "standard_review"
