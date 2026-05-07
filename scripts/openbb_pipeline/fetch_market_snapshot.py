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
    if symbol.endswith("=X") or target["symbol"] in ("EURUSD", "USDJPY", "AUDUSD", "USDCNH"):
        return "equity"
    if symbol.endswith("=F"):
        return "equity"
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
        "priority": target.get("priority"),
        "tags": target.get("tags", []),
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
        "priority": target.get("priority"),
        "tags": target.get("tags", []),
        "value": round(latest_close, 4),
        "unit": "" if target["symbol"] == "VIX" else "USD",
        "change": round(change, 4),
        "status": "ok",
        "provider": provider,
        "real_data": True,
        "latest_date": _row_date(latest),
        "previous_close": round(previous_close, 4),
    }


def _fetch_symbol_yfinance(target):
    try:
        import yfinance as yf
    except Exception as exc:
        raise ValueError(f"direct yfinance unavailable: {exc}") from exc

    frame = yf.download(_provider_symbol(target), period="14d", interval="1d", progress=False, auto_adjust=False, threads=False)
    if frame is None or frame.empty:
        raise ValueError("direct yfinance returned no rows")
    close = frame["Close"].dropna()
    if len(close) < 2:
        raise ValueError("direct yfinance returned fewer than two close values")
    latest_close = float(close.iloc[-1])
    previous_close = float(close.iloc[-2])
    if previous_close == 0:
        raise ValueError("direct yfinance returned zero previous close")
    latest_date = close.index[-1].date().isoformat() if hasattr(close.index[-1], "date") else str(close.index[-1])
    change = ((latest_close - previous_close) / previous_close) * 100
    return {
        "symbol": target["symbol"],
        "label": target.get("label", target["symbol"]),
        "name": target.get("name", target["symbol"]),
        "group": target.get("group"),
        "proxy": _provider_symbol(target),
        "tradingview_symbol": target.get("tradingview_symbol"),
        "priority": target.get("priority"),
        "tags": target.get("tags", []),
        "value": round(latest_close, 4),
        "unit": "" if target["symbol"] == "VIX" or target.get("group") == "FX" else "USD",
        "change": round(change, 4),
        "status": "ok",
        "provider": "yfinance",
        "real_data": True,
        "latest_date": latest_date,
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
            except Exception as openbb_exc:
                try:
                    asset = _fetch_symbol_yfinance(target)
                    print(f"Fetched {asset['symbol']} via direct yfinance fallback: {asset['value']}")
                    assets.append(asset)
                    warnings.append(f"{target['symbol']}: OpenBB path failed; direct yfinance fallback used: {openbb_exc}")
                except Exception as yf_exc:
                    status = f"unavailable: openbb={openbb_exc}; yfinance={yf_exc}"
                    warnings.append(f"{target['symbol']}: {status}")
                    print(f"Failed {target['symbol']}: {status}")
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
