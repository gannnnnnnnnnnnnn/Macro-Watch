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
    warning = "fallback: OpenBB unavailable" if openbb_client is None else "fallback: live fetch not wired in v0"
    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "warnings": [f"{warning}; wrote stress placeholder indicators."],
        "buckets": {
            bucket: [{"name": bucket, "value": None, "status": warning, "note": "Generated fallback placeholder"}]
            for bucket in BUCKETS
        },
    }
