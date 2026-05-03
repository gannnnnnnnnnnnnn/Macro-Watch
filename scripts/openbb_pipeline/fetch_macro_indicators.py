from datetime import datetime, timezone

GROUPS = ["Rates", "Liquidity", "Inflation", "Credit", "Volatility", "Dollar", "Commodities"]


def fetch_macro_indicators(openbb_client=None):
    warning = "fallback: OpenBB unavailable" if openbb_client is None else "fallback: live fetch not wired in v0"
    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "warnings": [f"{warning}; wrote macro placeholder indicators."],
        "groups": {
            group: [{"name": f"{group} indicator", "value": None, "status": warning, "note": "Generated fallback placeholder"}]
            for group in GROUPS
        },
    }
