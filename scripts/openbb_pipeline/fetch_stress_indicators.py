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


def fetch_stress_indicators(openbb_client=None):
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
    real_bucket_count = sum(
        any(item.get("real_data") for item in items)
        for items in [credit_items, liquidity_items, treasury_items]
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
            "Volatility stress": [_derived_indicator("VIX stress", None, "", None, False, "pending", "Use market VIX snapshot later; not wired into stress file yet.")],
            "Credit stress": credit_items,
            "Liquidity stress": liquidity_items,
            "Banking stress": [_derived_indicator("Banking stress", None, "", None, False, "pending", "Banking indicators not wired yet.")],
            "Household stress": [_derived_indicator("Household stress", None, "", None, False, "pending", "Household stress indicators not wired yet.")],
            "Leverage stress": [_derived_indicator("Leverage stress", None, "", None, False, "pending", "Leverage indicators not wired yet.")],
            "Treasury market stress": treasury_items,
        },
    }
