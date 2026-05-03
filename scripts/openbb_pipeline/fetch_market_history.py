from datetime import date, datetime, timedelta, timezone

from fetch_market_snapshot import TARGETS, _endpoint


def _value(row, field):
    value = getattr(row, field, None)
    if value is None and hasattr(row, "model_dump"):
        value = row.model_dump().get(field)
    return float(value) if value is not None else None


def _row_date(row):
    value = getattr(row, "date", None)
    if value is None and hasattr(row, "model_dump"):
        value = row.model_dump().get("date")
    return value.isoformat() if hasattr(value, "isoformat") else value


def _history_row(row):
    return {
        "date": _row_date(row),
        "open": _value(row, "open"),
        "high": _value(row, "high"),
        "low": _value(row, "low"),
        "close": _value(row, "close"),
        "volume": _value(row, "volume"),
    }


def _empty_history(target, status):
    return {
        "symbol": target.get("display_symbol", target["symbol"]),
        "proxy": target["symbol"],
        "name": target["name"],
        "provider": None,
        "status": status,
        "real_data": False,
        "rows": [],
    }


def _fetch_history(openbb_client, target):
    start = (date.today() - timedelta(days=90)).isoformat()
    endpoint = _endpoint(openbb_client, target["kind"])
    result = endpoint(symbol=target["symbol"], start_date=start, provider="yfinance", interval="1d")
    rows = [_history_row(row) for row in (getattr(result, "results", None) or [])]
    rows = [row for row in rows if row.get("date") and row.get("close") is not None]
    if not rows:
        raise ValueError("OpenBB returned no usable historical rows")

    provider = getattr(result, "provider", None) or "yfinance"
    return {
        "symbol": target.get("display_symbol", target["symbol"]),
        "proxy": target["symbol"],
        "name": target["name"],
        "provider": provider,
        "status": "ok",
        "real_data": True,
        "rows": rows[-60:],
    }


def fetch_market_history(openbb_client=None):
    warnings = []
    symbols = {}

    if openbb_client is None:
        warnings.append("OpenBB unavailable; wrote market history fallback records.")
        for target in TARGETS:
            symbols[target.get("display_symbol", target["symbol"])] = _empty_history(target, "fallback: OpenBB unavailable")
    else:
        for target in TARGETS:
            symbol = target.get("display_symbol", target["symbol"])
            try:
                history = _fetch_history(openbb_client, target)
                print(f"Fetched history for {symbol} via {history['provider']}: {len(history['rows'])} rows")
                symbols[symbol] = history
            except Exception as exc:
                status = f"unavailable: {exc}"
                warnings.append(f"{symbol} history: {status}")
                print(f"Failed history for {symbol}: {exc}")
                symbols[symbol] = _empty_history(target, status)

    real_count = sum(1 for item in symbols.values() if item.get("real_data"))
    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": "yfinance" if real_count else None,
        "status": "ok" if real_count == len(TARGETS) else "warning",
        "real_data": real_count > 0,
        "warnings": warnings,
        "symbols": symbols,
    }
