import pytest

from app.domain import DomainValidationError, normalize_domain


def test_normalize_domain_rejects_full_url() -> None:
    with pytest.raises(DomainValidationError):
        normalize_domain("https://example.com/login")


def test_normalize_domain_extracts_registrable_domain() -> None:
    assert normalize_domain("secure.paypal.com.example.test") == "example.test"


def test_normalize_domain_handles_common_second_level_tld() -> None:
    assert normalize_domain("login.example.co.uk") == "example.co.uk"
