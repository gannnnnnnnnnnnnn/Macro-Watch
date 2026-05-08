from datetime import date, datetime, timedelta, timezone

from catalog_utils import enabled_assets
from fetch_market_snapshot import _endpoint, _provider_symbol, _yf_column


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
        "symbol": target["symbol"],
        "proxy": _provider_symbol(target),
        "name": target.get("name", target["symbol"]),
        "group": target.get("group"),
        "tradingview_symbol": target.get("tradingview_symbol"),
        "priority": target.get("priority"),
        "tags": target.get("tags", []),
        "provider": None,
        "status": status,
        "real_data": False,
        "rows": [],
    }


def _fetch_history(openbb_client, target):
    start = (date.today() - timedelta(days=(365 * 5) + 30)).isoformat()
    result = _endpoint(openbb_client, target)(symbol=_provider_symbol(target), start_date=start, provider="yfinance", interval="1d")
    rows = [_history_row(row) for row in (getattr(result, "results", None) or [])]
    rows = [row for row in rows if row.get("date") and row.get("close") is not None]
    if not rows:
        raise ValueError("OpenBB returned no usable historical rows")

    provider = getattr(result, "provider", None) or "yfinance"
    return {
        "symbol": target["symbol"],
        "proxy": _provider_symbol(target),
        "name": target.get("name", target["symbol"]),
        "group": target.get("group"),
        "tradingview_symbol": target.get("tradingview_symbol"),
        "priority": target.get("priority"),
        "tags": target.get("tags", []),
        "provider": provider,
        "status": "ok",
        "real_data": True,
        "rows": rows,
    }


def _fetch_history_yfinance(target):
    try:
        import yfinance as yf
    except Exception as exc:
        raise ValueError(f"direct yfinance unavailable: {exc}") from exc

    frame = yf.download(_provider_symbol(target), period="5y", interval="1d", progress=False, auto_adjust=False, threads=False)
    if frame is None or frame.empty:
        raise ValueError("direct yfinance returned no historical rows")
    columns = {}
    for field in ("Open", "High", "Low", "Close", "Volume"):
        try:
            columns[field] = _yf_column(frame, field)
        except ValueError:
            if field == "Close":
                raise
            columns[field] = None
    rows = []
    for index in frame.index:
        close = columns["Close"].loc[index]
        if close is None or close != close:
            continue
        raw_date = index.date().isoformat() if hasattr(index, "date") else str(index)
        def clean(value):
            try:
                return float(value) if value == value else None
            except Exception:
                return None
        rows.append({
            "date": raw_date,
            "open": clean(columns["Open"].loc[index]) if columns["Open"] is not None else None,
            "high": clean(columns["High"].loc[index]) if columns["High"] is not None else None,
            "low": clean(columns["Low"].loc[index]) if columns["Low"] is not None else None,
            "close": clean(close),
            "volume": clean(columns["Volume"].loc[index]) if columns["Volume"] is not None else None,
        })
    if not rows:
        raise ValueError("direct yfinance returned no usable historical rows")
    return {
        "symbol": target["symbol"],
        "proxy": _provider_symbol(target),
        "name": target.get("name", target["symbol"]),
        "group": target.get("group"),
        "tradingview_symbol": target.get("tradingview_symbol"),
        "priority": target.get("priority"),
        "tags": target.get("tags", []),
        "provider": "yfinance",
        "status": "ok",
        "real_data": True,
        "rows": rows,
    }


def fetch_market_history(openbb_client=None):
    warnings = []
    symbols = {}
    targets = enabled_assets()

    if openbb_client is None:
        warnings.append("OpenBB unavailable; wrote market history fallback records.")
        for target in targets:
            symbols[target["symbol"]] = _empty_history(target, "fallback: OpenBB unavailable")
    else:
        for target in targets:
            symbol = target["symbol"]
            try:
                history = _fetch_history(openbb_client, target)
                print(f"Fetched history for {symbol} via {history['provider']}: {len(history['rows'])} rows")
                symbols[symbol] = history
            except Exception as openbb_exc:
                try:
                    history = _fetch_history_yfinance(target)
                    print(f"Fetched history for {symbol} via direct yfinance fallback: {len(history['rows'])} rows")
                    symbols[symbol] = history
                    warnings.append(f"{symbol} history: OpenBB path failed; direct yfinance fallback used: {openbb_exc}")
                except Exception as yf_exc:
                    status = f"unavailable: openbb={openbb_exc}; yfinance={yf_exc}"
                    warnings.append(f"{symbol} history: {status}")
                    print(f"Failed history for {symbol}: {status}")
                    symbols[symbol] = _empty_history(target, status)

    real_count = sum(1 for item in symbols.values() if item.get("real_data"))
    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": "yfinance" if real_count else None,
        "status": "ok" if targets and real_count == len(targets) else "warning",
        "real_data": real_count > 0,
        "warnings": warnings,
        "symbols": symbols,
    }
