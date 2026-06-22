from dataclasses import dataclass

from fastapi.testclient import TestClient

from app.main import app
from app.models import ReputationFinding
from app.rdap.client import RdapResult


@dataclass
class FakeRdapClient:
    async def lookup_domain(self, domain: str) -> RdapResult:
        return RdapResult(domain_age_days=3, available=True)


@dataclass
class FakeFeedRepository:
    async def check_domain(self, domain: str) -> list[ReputationFinding]:
        return [
            ReputationFinding(
                source="test-feed",
                status="match",
                description=f"{domain} matched test feed.",
            )
        ]


def test_analyze_domain_returns_explainable_signals(monkeypatch) -> None:
    monkeypatch.setattr("app.routers.domain_analysis.rdap_client", FakeRdapClient())
    monkeypatch.setattr("app.routers.domain_analysis.feed_repository", FakeFeedRepository())
    client = TestClient(app)

    response = client.post(
        "/v1/analyze/domain",
        json={"domain": "secure.example.test", "clientVersion": "0.1.0"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["domain"] == "example.test"
    assert {signal["id"] for signal in payload["riskSignals"]} == {
        "phishing-feed-match",
        "very-new-domain",
    }
    assert payload["reputation"]["domainAgeDays"] == 3


def test_analyze_domain_rejects_full_url() -> None:
    client = TestClient(app)
    response = client.post("/v1/analyze/domain", json={"domain": "https://example.com/login"})
    assert response.status_code == 400


def test_report_site_returns_region_destinations() -> None:
    client = TestClient(app)
    response = client.post(
        "/v1/report",
        json={
            "url": "https://secure.example.test/login",
            "verdict": "unsafe",
            "scamType": "phishing",
            "region": "CA",
            "result": {"score": 45, "riskLevel": "medium"},
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["routingDecision"] == "review_priority"
    assert {destination["id"] for destination in payload["destinations"]} >= {
        "ca-cafc",
        "ca-cyber-centre",
    }


def test_report_site_marks_low_risk_result_standard_review() -> None:
    client = TestClient(app)
    response = client.post(
        "/v1/report",
        json={
            "url": "https://example.test",
            "verdict": "unsafe",
            "scamType": "other",
            "region": "US",
            "result": {"score": 10, "riskLevel": "low"},
        },
    )

    assert response.status_code == 200
    assert response.json()["routingDecision"] == "standard_review"


def test_report_site_rejects_invalid_region() -> None:
    client = TestClient(app)
    response = client.post(
        "/v1/report",
        json={
            "url": "https://example.test",
            "verdict": "unsafe",
            "scamType": "phishing",
            "region": "GB",
            "result": {"score": 45, "riskLevel": "medium"},
        },
    )

    assert response.status_code == 422
