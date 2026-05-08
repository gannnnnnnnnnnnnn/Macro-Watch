from datetime import datetime, timedelta, timezone
from math import isfinite, sqrt


ALLOWED_BUCKETS = {
    "volatility", "credit", "liquidity", "treasury", "banking", "household", "leverage",
    "growth", "inflation", "fx", "commodity", "equity", "rates", "unknown",
}


def _clean_number(value):
    if not isinstance(value, (int, float)):
        return None
    value = float(value)
    return value if isfinite(value) else None


def _latest_value(value):
    cleaned = _clean_number(value)
    if cleaned is not None:
        return cleaned
    return value if not isinstance(value, (int, float)) else None


def _values(rows, field="value"):
    values = []
    for row in rows or []:
        value = _clean_number(row.get(field))
        raw_date = row.get("date")
        if value is not None and raw_date:
            try:
                parsed_date = datetime.fromisoformat(str(raw_date)[:10]).date()
            except ValueError:
                continue
            values.append((parsed_date, value))
    return values


def _pctile(latest, values):
    if latest is None or len(values) < 20:
        return None
    below = sum(1 for value in values if value <= latest)
    return round(below / len(values), 4)


def _zscore(latest, values):
    if latest is None or len(values) < 20:
        return None
    mean = sum(values) / len(values)
    variance = sum((value - mean) ** 2 for value in values) / len(values)
    std = sqrt(variance)
    return round((latest - mean) / std, 4) if std else None


def _change_calendar(values, calendar_days):
    if len(values) < 2:
        return None
    latest_date, latest = values[-1]
    target_date = latest_date - timedelta(days=calendar_days)
    prior = next((value for raw_date, value in reversed(values[:-1]) if raw_date <= target_date), None)
    if prior is None:
        return None
    return round(latest - prior, 4)


def _trend(values):
    if len(values) < 20:
        return "unavailable"
    latest = values[-1][1]
    prior = values[-20][1]
    if latest > prior:
        return "rising"
    if latest < prior:
        return "falling"
    return "flat"


def _transforms(rows, field="value"):
    series = _values(rows, field)
    values = [value for _date, value in series]
    latest = values[-1] if values else None
    latest_5y = values[-1260:] if values else []
    recent_1m = _change_calendar(series, 30)
    recent_3m = _change_calendar(series, 90)
    recent_1y = _change_calendar(series, 365)
    acceleration_value = round(recent_1m - recent_3m, 4) if recent_1m is not None and recent_3m is not None else None
    if acceleration_value is None:
        acceleration = "unknown"
    elif acceleration_value > 0.0001:
        acceleration = "positive"
    elif acceleration_value < -0.0001:
        acceleration = "negative"
    else:
        acceleration = "flat"
    return {
        "percentile_5y": _pctile(latest, latest_5y),
        "z_score_5y": _zscore(latest, latest_5y),
        "rolling_change_1m": recent_1m,
        "rolling_change_3m": recent_3m,
        "rolling_change_1y": recent_1y,
        "trend": _trend(series),
        "acceleration": acceleration,
        "acceleration_value": acceleration_value,
    }


def _asset_bucket(asset):
    group = (asset.get("group") or "").lower()
    symbol = asset.get("symbol")
    name = (asset.get("name") or "").lower()
    provider_symbol = asset.get("proxy") or asset.get("provider_symbol") or ""
    # Order matters: specific stress/asset proxies must be classified before
    # generic sector/equity groups, otherwise KRE/XLF become plain equity.
    if symbol == "VIX" or "volatility" in group:
        return "volatility"
    if "bank" in name or symbol in ("KRE", "XLF"):
        return "banking"
    if symbol in ("HYG", "LQD", "EMB"):
        return "credit"
    if symbol in ("TLT", "IEF", "SHY") or "rates" in group:
        return "treasury"
    if "credit" in group:
        return "credit"
    if "fx" in group or symbol in ("DXY", "UUP", "EURUSD", "USDJPY", "AUDUSD", "USDCNH"):
        return "fx"
    if "commodities" in group or provider_symbol.endswith("=F") or symbol in ("GLD", "SLV", "USO", "CPER", "UNG"):
        return "commodity"
    # Generic equity/sector checks stay after stress, FX, rates, and commodity
    # checks so macro buckets remain stable as the catalog grows.
    if "equity" in group or "sector" in group or "mega" in group or "global" in group:
        return "equity"
    if "crypto" in group:
        return "equity"
    return "unknown"


def _indicator_bucket(item):
    group = (item.get("group") or item.get("bucket") or "").lower()
    if "credit" in group or "financial" in group:
        return "credit"
    if "liquidity" in group:
        return "liquidity"
    if "rate" in group or "treasury" in group:
        return "rates"
    if "real rates" in group:
        return "rates"
    if "inflation" in group:
        return "inflation"
    if "labor" in group:
        return "household"
    if "growth" in group:
        return "growth"
    if "housing" in group:
        return "household"
    return "unknown"


def _confidence(real_data, history_points):
    if not real_data:
        return "low"
    if history_points >= 1000:
        return "high"
    if history_points >= 100:
        return "medium"
    return "low"


def _boundary():
    return "Mechanical observation only. Not a trading signal, regime call, or buy/sell advice."


def build_signal_cards(market_snapshot, market_history, macro_indicators, stress_indicators, indicator_history):
    cards = []
    warnings = []
    asset_ids = set()
    for asset in market_snapshot.get("assets", []):
        symbol = asset.get("symbol")
        asset_ids.add(symbol)
        history_rows = market_history.get("symbols", {}).get(symbol, {}).get("rows", [])
        transforms = _transforms(history_rows, "close")
        if transforms["percentile_5y"] is None:
            warnings.append(f"{symbol}: history too short for 5Y percentile or unavailable")
        real_data = bool(asset.get("real_data"))
        cards.append({
            "id": f"asset:{symbol}",
            "type": "asset",
            "bucket": _asset_bucket(asset),
            "label": asset.get("label") or symbol,
            "source_id": symbol,
            "latest_value": _latest_value(asset.get("value")),
            "unit": asset.get("unit", ""),
            "latest_date": asset.get("latest_date"),
            "provider": asset.get("provider"),
            "status": asset.get("status", "unavailable"),
            "real_data": real_data,
            "history_points": len(history_rows),
            "transforms": transforms,
            "directionality": "context_dependent",
            "confidence": _confidence(real_data, len(history_rows)),
            "coverage_note": "Local market history available." if history_rows else "Market history unavailable.",
            "interpretation_boundary": _boundary(),
            "href": f"/assets/{symbol}",
        })

    indicators = {}
    for item in [*sum((items for items in (macro_indicators.get("groups") or {}).values()), []), *sum((items for items in (stress_indicators.get("buckets") or {}).values()), [])]:
        source_id = item.get("id") or item.get("series_id") or item.get("name")
        if source_id and source_id not in indicators:
            indicators[source_id] = item

    for source_id, item in indicators.items():
        if source_id in asset_ids:
            continue
        history_rows = indicator_history.get("indicators", {}).get(source_id, {}).get("rows", [])
        transforms = _transforms(history_rows, "value")
        if transforms["percentile_5y"] is None:
            warnings.append(f"{source_id}: history too short for 5Y percentile or unavailable")
        real_data = bool(item.get("real_data"))
        item_type = "derived" if not item.get("series_id") else "indicator"
        bucket = _indicator_bucket(item)
        if bucket not in ALLOWED_BUCKETS:
            bucket = "unknown"
        cards.append({
            "id": f"{item_type}:{source_id}",
            "type": item_type,
            "bucket": bucket,
            "label": item.get("label") or item.get("name") or source_id,
            "source_id": source_id,
            "latest_value": _latest_value(item.get("value")),
            "unit": item.get("unit", ""),
            "latest_date": item.get("latest_date"),
            "provider": item.get("provider"),
            "status": item.get("status", "unavailable"),
            "real_data": real_data,
            "history_points": len(history_rows),
            "transforms": transforms,
            "directionality": item.get("directionality", "context_dependent"),
            "confidence": _confidence(real_data, len(history_rows)),
            "coverage_note": "Indicator history available." if history_rows else "Indicator history unavailable.",
            "interpretation_boundary": _boundary(),
            "href": f"/indicators/{source_id}",
        })

    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "ok" if cards and not warnings else "partial" if cards else "warning",
        "real_data": any(card.get("real_data") for card in cards),
        "warnings": warnings,
        "cards": cards,
    }
