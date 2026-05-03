from datetime import datetime, timezone

from fetch_macro_indicators import _derived_indicator, _indicator, build_fred_macro_data

BUCKETS = [
    "Volatility stress",
    "Credit stress",
    "Liquidity stress",
    "Banking stress",
    "Household stress",
    "Leverage stress",
    "Treasury market stress",
]


def _vix_indicator(market_snapshot=None):
    assets = (market_snapshot or {}).get("assets", [])
    vix = next((asset for asset in assets if asset.get("symbol") == "VIX"), None)
    if not vix:
        return _derived_indicator("VIX", None, "", None, False, "unavailable", "Market-implied volatility proxy from OpenBB/yfinance.")
    return {
        "name": "VIX",
        "value": vix.get("value"),
        "unit": "",
        "latest_date": vix.get("latest_date"),
        "provider": vix.get("provider"),
        "real_data": bool(vix.get("real_data")),
        "status": "real" if vix.get("real_data") else "unavailable",
        "note": "Market-implied volatility proxy from OpenBB/yfinance.",
    }


def fetch_stress_indicators(openbb_client=None, market_snapshot=None):
    macro_groups, series, warnings, real_count, total = build_fred_macro_data()
    credit_items = [
        _indicator("High yield OAS", "%", series["BAMLH0A0HYM2"], "Real credit stress proxy from FRED."),
        _indicator("Baa spread vs 10Y", "%", series["BAA10Y"], "Real credit stress proxy from FRED."),
    ]
    liquidity_items = [
        _indicator("Fed total assets", "USD millions", series["WALCL"], "Partial liquidity context from FRED."),
        _indicator("Overnight reverse repos", "USD billions", series["RRPONTSYD"], "Partial liquidity context from FRED."),
    ]
    treasury_items = macro_groups["Rates"][:3]
    volatility_items = [_vix_indicator(market_snapshot)]
    real_bucket_count = sum(
        any(item.get("real_data") for item in items)
        for items in [volatility_items, credit_items, liquidity_items, treasury_items]
    )
    status = "partial" if real_bucket_count else "warning"
    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": "FRED",
        "status": status,
        "real_data": real_bucket_count > 0,
        "warnings": warnings,
        "series": {
            series_id: {
                "provider": result.get("provider"),
                "status": result.get("status"),
                "real_data": bool(result.get("real_data")),
                "latest_date": result.get("latest_date"),
            }
            for series_id, result in series.items()
        },
        "buckets": {
            "Volatility stress": volatility_items,
            "Credit stress": credit_items,
            "Liquidity stress": liquidity_items,
            "Banking stress": [_derived_indicator("Banking stress", None, "", None, False, "pending", "Banking indicators not wired yet.")],
            "Household stress": [_derived_indicator("Household stress", None, "", None, False, "pending", "Household stress indicators not wired yet.")],
            "Leverage stress": [_derived_indicator("Leverage stress", None, "", None, False, "pending", "Leverage indicators not wired yet.")],
            "Treasury market stress": treasury_items,
        },
    }
