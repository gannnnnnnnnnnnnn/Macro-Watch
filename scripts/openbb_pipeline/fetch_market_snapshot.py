from datetime import date, datetime, timedelta, timezone

TARGETS = [
    {"symbol": "SPY", "name": "S&P 500 proxy", "kind": "equity", "unit": "USD"},
    {"symbol": "QQQ", "name": "Nasdaq 100 proxy", "kind": "equity", "unit": "USD"},
    {"symbol": "^VIX", "display_symbol": "VIX", "name": "VIX proxy", "kind": "index", "unit": ""},
    {"symbol": "UUP", "name": "US dollar proxy", "kind": "equity", "unit": "USD"},
    {"symbol": "TLT", "name": "US10Y/Treasury proxy", "kind": "equity", "unit": "USD"},
    {"symbol": "GLD", "name": "Gold proxy", "kind": "equity", "unit": "USD"},
    {"symbol": "USO", "name": "Oil proxy", "kind": "equity", "unit": "USD"},
    {"symbol": "BTC-USD", "name": "Bitcoin", "kind": "crypto", "unit": "USD"},
]


def _empty_asset(target, status):
    return {
        "symbol": target.get("display_symbol", target["symbol"]),
        "name": target["name"],
        "value": None,
        "unit": target.get("unit", ""),
        "change": None,
        "status": status,
        "provider": None,
        "real_data": False,
    }


def _endpoint(openbb_client, kind):
    if kind == "crypto":
        return openbb_client.crypto.price.historical
    if kind == "index":
        return openbb_client.index.price.historical
    return openbb_client.equity.price.historical


def _close(row):
    value = getattr(row, "close", None)
    if value is None and hasattr(row, "model_dump"):
        value = row.model_dump().get("close")
    return float(value) if value is not None else None


def _row_date(row):
    value = getattr(row, "date", None)
    if value is None and hasattr(row, "model_dump"):
        value = row.model_dump().get("date")
    return value.isoformat() if hasattr(value, "isoformat") else value


def _fetch_symbol(openbb_client, target):
    start = (date.today() - timedelta(days=14)).isoformat()
    endpoint = _endpoint(openbb_client, target["kind"])
    result = endpoint(symbol=target["symbol"], start_date=start, provider="yfinance", interval="1d")
    rows = [row for row in (getattr(result, "results", None) or []) if _close(row) is not None]
    if len(rows) < 2:
        raise ValueError("OpenBB returned fewer than two close values")

    latest = rows[-1]
    previous = rows[-2]
    latest_close = _close(latest)
    previous_close = _close(previous)
    if latest_close is None or previous_close in (None, 0):
        raise ValueError("OpenBB returned unusable close values")

    change = ((latest_close - previous_close) / previous_close) * 100
    provider = getattr(result, "provider", None) or "yfinance"
    return {
        "symbol": target.get("display_symbol", target["symbol"]),
        "name": target["name"],
        "proxy": target["symbol"],
        "value": round(latest_close, 4),
        "unit": target.get("unit", ""),
        "change": round(change, 4),
        "status": "ok",
        "provider": provider,
        "real_data": True,
        "latest_date": _row_date(latest),
        "previous_close": round(previous_close, 4),
    }


def fetch_market_snapshot(openbb_client=None):
    warnings = []
    assets = []
    if openbb_client is None:
        warnings.append("OpenBB unavailable; wrote market fallback records.")
        assets = [_empty_asset(target, "fallback: OpenBB unavailable") for target in TARGETS]
    else:
        for target in TARGETS:
            try:
                asset = _fetch_symbol(openbb_client, target)
                print(f"Fetched {asset['symbol']} via {asset['provider']}: {asset['value']}")
                assets.append(asset)
            except Exception as exc:
                status = f"unavailable: {exc}"
                warnings.append(f"{target.get('display_symbol', target['symbol'])}: {status}")
                print(f"Failed {target.get('display_symbol', target['symbol'])}: {exc}")
                assets.append(_empty_asset(target, status))

    real_count = sum(1 for asset in assets if asset.get("real_data"))

    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": "yfinance" if real_count else None,
        "status": "ok" if real_count == len(assets) else "warning",
        "real_data": real_count > 0,
        "warnings": warnings,
        "assets": assets,
        "watchlist": assets,
    }
