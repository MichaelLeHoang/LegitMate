from __future__ import annotations

import ipaddress


COMMON_SECOND_LEVEL_TLDS = {"co", "com", "net", "org", "gov", "ac", "edu"}


class DomainValidationError(ValueError):
    """Raised when a user-provided domain is not safe to analyze."""


def normalize_domain(value: str) -> str:
    candidate = value.strip().rstrip(".").lower()
    if not candidate:
        raise DomainValidationError("Domain is required.")
    if "://" in candidate or "/" in candidate or "@" in candidate:
        raise DomainValidationError("Send only a hostname or registrable domain.")

    if _is_ip_address(candidate):
        return candidate

    try:
        ascii_domain = candidate.encode("idna").decode("ascii")
    except UnicodeError as exc:
        raise DomainValidationError("Domain contains invalid characters.") from exc

    labels = ascii_domain.split(".")
    if any(not label or len(label) > 63 for label in labels):
        raise DomainValidationError("Domain label is invalid.")
    if len(ascii_domain) > 253:
        raise DomainValidationError("Domain is too long.")
    if any(label.startswith("-") or label.endswith("-") for label in labels):
        raise DomainValidationError("Domain label cannot start or end with a hyphen.")
    if not all(_is_valid_label(label) for label in labels):
        raise DomainValidationError("Domain contains invalid characters.")

    return _registrable_domain(ascii_domain)


def _registrable_domain(hostname: str) -> str:
    labels = hostname.split(".")
    if len(labels) < 2:
        return hostname
    second_level, top_level = labels[-2:]
    if len(labels) >= 3 and len(top_level) == 2 and second_level in COMMON_SECOND_LEVEL_TLDS:
        return ".".join(labels[-3:])
    return ".".join(labels[-2:])


def _is_ip_address(value: str) -> bool:
    try:
        ipaddress.ip_address(value.strip("[]"))
        return True
    except ValueError:
        return False


def _is_valid_label(label: str) -> bool:
    return all(character.isalnum() or character == "-" for character in label)
