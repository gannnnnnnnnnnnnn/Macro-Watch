from datetime import datetime, timezone

from fetch_macro_indicators import build_fred_macro_data

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
        return _pending("VIX", "Market-implied volatility proxy from OpenBB/yfinance.", "unavailable")
    return {
        "name": "VIX",
        "id": "VIX",
        "value": vix.get("value"),
        "unit": "",
        "latest_date": vix.get("latest_date"),
        "provider": vix.get("provider"),
        "real_data": bool(vix.get("real_data")),
        "status": "real" if vix.get("real_data") else "unavailable",
        "note": "Market-implied volatility proxy from OpenBB/yfinance.",
    }


def _pending(name, note, status="pending"):
    return {
        "id": name.lower().replace(" ", "-"),
        "name": name,
        "value": None,
        "unit": "",
        "latest_date": None,
        "provider": None,
        "real_data": False,
        "status": status,
        "note": note,
        "delta_label": "Δ previous unavailable",
        "one_year_delta_label": "1Y change unavailable",
    }


def fetch_stress_indicators(openbb_client=None, market_snapshot=None):
    macro_groups, series, warnings, real_count, total, _indicator_history = build_fred_macro_data()
    by_name = {item.get("name"): item for items in macro_groups.values() for item in items}
    credit_items = [
        by_name.get("High yield OAS"),
        by_name.get("BBB OAS"),
        by_name.get("Baa spread vs 10Y"),
        by_name.get("St. Louis Fed stress index"),
        by_name.get("Chicago Fed NFCI"),
    ]
    liquidity_items = [
        by_name.get("Fed total assets"),
        by_name.get("Overnight reverse repos"),
        by_name.get("Reserve balances"),
    ]
    credit_items = [item for item in credit_items if item]
    liquidity_items = [item for item in liquidity_items if item]
    treasury_items = [item for item in macro_groups.get("Rates", []) if item.get("name") in ("10Y Treasury yield", "2Y Treasury yield", "3M Treasury yield", "10Y-2Y spread", "10Y-3M spread")]
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
            "Banking stress": [_pending("Banking stress", "Banking indicators not wired yet.")],
            "Household stress": [_pending("Household stress", "Household stress indicators not wired yet.")],
            "Leverage stress": [_pending("Leverage stress", "Leverage indicators not wired yet.")],
            "Treasury market stress": treasury_items,
        },
    }
