from datetime import datetime, timezone

GROUPS = ["Rates", "Liquidity", "Inflation", "Credit", "Volatility", "Dollar", "Commodities"]


def fetch_macro_indicators(openbb_client=None):
    warning = "placeholder: direct macro/FRED fetch not wired in v0"
    if openbb_client is None:
        warning = "placeholder: OpenBB unavailable; direct macro/FRED fetch not wired in v0"
    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": None,
        "status": "warning",
        "real_data": False,
        "warnings": [f"{warning}; wrote macro placeholder indicators."],
        "groups": {
            group: [{"name": f"{group} indicator", "value": None, "status": warning, "note": "Generated fallback placeholder"}]
            for group in GROUPS
        },
    }
