from __future__ import annotations

from app.models import ReputationFinding, RiskSignal
from app.reputation.rdap import RdapResult


def signals_from_reputation(findings: list[ReputationFinding], rdap: RdapResult) -> list[RiskSignal]:
    signals: list[RiskSignal] = []

    for finding in findings:
        if finding.status == "match":
            signals.append(
                RiskSignal(
                    id="phishing-feed-match",
                    title="Threat feed match",
                    description=finding.description,
                    severity="high",
                    scoreImpact=45,
                    source="reputation"
                )
            )

    if rdap.domain_age_days is not None:
        if rdap.domain_age_days <= 30:
            signals.append(
                RiskSignal(
                    id="very-new-domain",
                    title="Very new domain",
                    description=f"The domain appears to be {rdap.domain_age_days} days old.",
                    severity="high",
                    scoreImpact=30,
                    source="rdap"
                )
            )
        elif rdap.domain_age_days <= 90:
            signals.append(
                RiskSignal(
                    id="new-domain",
                    title="Recently registered domain",
                    description=f"The domain appears to be {rdap.domain_age_days} days old.",
                    severity="medium",
                    scoreImpact=15,
                    source="rdap"
                )
            )

    return signals
