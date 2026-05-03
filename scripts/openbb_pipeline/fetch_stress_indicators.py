from datetime import datetime, timezone

BUCKETS = [
    "Volatility stress",
    "Credit stress",
    "Liquidity stress",
    "Banking stress",
    "Household stress",
    "Leverage stress",
    "Treasury market stress",
]


def fetch_stress_indicators(openbb_client=None):
    warning = "placeholder: direct stress data fetch not wired in v0"
    if openbb_client is None:
        warning = "placeholder: OpenBB unavailable; direct stress data fetch not wired in v0"
    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": None,
        "status": "warning",
        "real_data": False,
        "warnings": [f"{warning}; wrote stress placeholder indicators."],
        "buckets": {
            bucket: [{"name": bucket, "value": None, "status": warning, "note": "Generated fallback placeholder"}]
            for bucket in BUCKETS
        },
    }
