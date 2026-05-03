from datetime import date, datetime, timedelta, timezone

from catalog_utils import enabled_assets


def _provider_symbol(target):
    return target.get("provider_symbol") or target["symbol"]


def _kind(target):
    symbol = _provider_symbol(target)
    if symbol.endswith("-USD"):
        return "crypto"
    if symbol.startswith("^"):
        return "index"
    return "equity"


def _endpoint(openbb_client, target):
    kind = _kind(target)
    if kind == "crypto":
        return openbb_client.crypto.price.historical
    if kind == "index":
        return openbb_client.index.price.historical
    return openbb_client.equity.price.historical


def _empty_asset(target, status):
    return {
        "symbol": target["symbol"],
        "label": target.get("label", target["symbol"]),
        "name": target.get("name", target["symbol"]),
        "group": target.get("group"),
        "proxy": _provider_symbol(target),
        "tradingview_symbol": target.get("tradingview_symbol"),
        "value": None,
        "unit": "" if target["symbol"] == "VIX" else "USD",
        "change": None,
        "status": status,
        "provider": None,
        "real_data": False,
    }


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
    result = _endpoint(openbb_client, target)(symbol=_provider_symbol(target), start_date=start, provider="yfinance", interval="1d")
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
        "symbol": target["symbol"],
        "label": target.get("label", target["symbol"]),
        "name": target.get("name", target["symbol"]),
        "group": target.get("group"),
        "proxy": _provider_symbol(target),
        "tradingview_symbol": target.get("tradingview_symbol"),
        "value": round(latest_close, 4),
        "unit": "" if target["symbol"] == "VIX" else "USD",
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
    targets = enabled_assets()

    if openbb_client is None:
        warnings.append("OpenBB unavailable; wrote market fallback records.")
        assets = [_empty_asset(target, "fallback: OpenBB unavailable") for target in targets]
    else:
        for target in targets:
            try:
                asset = _fetch_symbol(openbb_client, target)
                print(f"Fetched {asset['symbol']} via {asset['provider']}: {asset['value']}")
                assets.append(asset)
            except Exception as exc:
                status = f"unavailable: {exc}"
                warnings.append(f"{target['symbol']}: {status}")
                print(f"Failed {target['symbol']}: {exc}")
                assets.append(_empty_asset(target, status))

    real_count = sum(1 for asset in assets if asset.get("real_data"))
    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": "yfinance" if real_count else None,
        "status": "ok" if assets and real_count == len(assets) else "warning",
        "real_data": real_count > 0,
        "warnings": warnings,
        "assets": assets,
        "watchlist": assets,
    }
