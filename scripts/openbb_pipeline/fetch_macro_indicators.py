import csv
from datetime import date, datetime, timedelta, timezone
from io import StringIO
from urllib.parse import urlencode
from urllib.request import urlopen

from catalog_utils import enabled_derived_indicators, enabled_indicators

_CACHE = None


def _fetch_fred_series(series_id, start=None):
    start_date = start or (date.today() - timedelta(days=3650))
    try:
        from pandas_datareader import data as pdr

        frame = pdr.DataReader(series_id, "fred", start_date)
        values = frame[series_id].dropna()
        if values.empty:
            raise ValueError("FRED returned no non-null values")
        return {
            "series_id": series_id,
            "value": float(values.iloc[-1]),
            "latest_date": values.index[-1].date().isoformat(),
            "provider": "FRED",
            "real_data": True,
            "status": "real",
            "history": [(idx.date().isoformat(), float(value)) for idx, value in values.items()],
            "reader": "pandas_datareader",
        }
    except Exception as exc:
        return _fetch_fred_csv(series_id, start_date, exc)


def _fetch_fred_csv(series_id, start_date, first_error):
    try:
        query = urlencode({"id": series_id, "observation_start": start_date.isoformat()})
        with urlopen(f"https://fred.stlouisfed.org/graph/fredgraph.csv?{query}", timeout=20) as response:
            text = response.read().decode("utf-8")
        rows = []
        for row in csv.DictReader(StringIO(text)):
            raw_value = row.get(series_id)
            raw_date = row.get("observation_date")
            if not raw_date or raw_value in (None, "", "."):
                continue
            rows.append((raw_date, float(raw_value)))
        if not rows:
            raise ValueError("FRED CSV returned no usable values")
        return {
            "series_id": series_id,
            "value": rows[-1][1],
            "latest_date": rows[-1][0],
            "provider": "FRED",
            "real_data": True,
            "status": "real",
            "history": rows,
            "reader": "fred_csv",
        }
    except Exception as csv_exc:
        return {
            "series_id": series_id,
            "value": None,
            "latest_date": None,
            "provider": "FRED",
            "real_data": False,
            "status": f"unavailable: pandas_datareader={first_error}; fred_csv={csv_exc}",
            "history": [],
            "reader": "unavailable",
        }


def _delta_fields(history):
    if len(history) < 2:
        return {
            "previous_value": None,
            "delta": None,
            "delta_label": "Δ previous unavailable",
            "one_year_delta": None,
            "one_year_delta_label": "1Y change unavailable",
        }
    latest_value = history[-1][1]
    previous_value = history[-2][1]
    delta = latest_value - previous_value
    latest_date = datetime.fromisoformat(history[-1][0]).date()
    one_year_prior = next(
        (value for raw_date, value in reversed(history[:-1]) if (latest_date - datetime.fromisoformat(raw_date).date()).days >= 330),
        None,
    )
    one_year_delta = latest_value - one_year_prior if one_year_prior is not None else None
    return {
        "previous_value": round(previous_value, 4),
        "delta": round(delta, 4),
        "delta_label": f"Δ previous {delta:+.4f}",
        "one_year_delta": round(one_year_delta, 4) if one_year_delta is not None else None,
        "one_year_delta_label": f"1Y change {one_year_delta:+.4f}" if one_year_delta is not None else "1Y change unavailable",
    }


def _indicator(config, result):
    history = result.get("history", [])
    return {
        "id": config.get("id", config["series_id"]),
        "series_id": config["series_id"],
        "name": config.get("label", config.get("name", config["series_id"])),
        "label": config.get("label", config.get("name", config["series_id"])),
        "group": config.get("group"),
        "value": round(result["value"], 4) if isinstance(result.get("value"), float) else result.get("value"),
        "unit": config.get("unit", ""),
        "latest_date": result.get("latest_date"),
        "provider": result.get("provider", "FRED"),
        "real_data": bool(result.get("real_data")),
        "status": result.get("status", "unavailable"),
        "note": f"FRED {config['series_id']}.",
        "directionality": config.get("directionality"),
        "priority": config.get("priority"),
        "tags": config.get("tags", []),
        **_delta_fields(history),
    }


def _derived_indicator(config, history, status="real", note=None):
    latest = history[-1] if history else (None, None)
    return {
        "id": config["id"],
        "name": config.get("label", config["id"]),
        "label": config.get("label", config["id"]),
        "group": config.get("group"),
        "value": round(latest[1], 4) if isinstance(latest[1], float) else latest[1],
        "unit": config.get("unit", ""),
        "latest_date": latest[0],
        "provider": "FRED",
        "real_data": bool(history),
        "status": status if history else "unavailable",
        "note": note or config.get("name", "Derived from FRED series."),
        "directionality": config.get("directionality"),
        "priority": config.get("priority"),
        "tags": config.get("tags", []),
        **_delta_fields(history),
    }


def _align_binary_history(left, right, operation):
    right_by_date = {raw_date: value for raw_date, value in right}
    rows = []
    for raw_date, value in left:
        if raw_date in right_by_date:
            rows.append((raw_date, operation(value, right_by_date[raw_date])))
    return rows


def _cpi_yoy_history(history):
    rows = []
    if len(history) < 13:
        return rows
    for index in range(12, len(history)):
        raw_date, latest = history[index]
        prior = history[index - 12][1]
        if prior:
            rows.append((raw_date, ((latest / prior) - 1) * 100))
    return rows


def build_fred_macro_data():
    global _CACHE
    if _CACHE is not None:
        return _CACHE

    configs = enabled_indicators()
    derived_configs = enabled_derived_indicators()
    raw_series = {config["series_id"]: _fetch_fred_series(config["series_id"]) for config in configs}
    warnings = [f"{series_id}: {result['status']}" for series_id, result in raw_series.items() if not result.get("real_data")]

    groups = {}
    indicator_history = {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": "FRED",
        "status": "ok",
        "real_data": False,
        "warnings": warnings.copy(),
        "indicators": {},
    }

    for config in configs:
        result = raw_series[config["series_id"]]
        item = _indicator(config, result)
        groups.setdefault(config.get("group", "Other"), []).append(item)
        history_rows = [{"date": raw_date, "value": value} for raw_date, value in result.get("history", [])]
        indicator_history["indicators"][config.get("id", config["series_id"])] = {
            "id": config.get("id", config["series_id"]),
            "series_id": config["series_id"],
            "label": config.get("label", config["series_id"]),
            "name": config.get("name", config.get("label", config["series_id"])),
            "group": config.get("group"),
            "unit": config.get("unit", ""),
            "provider": result.get("provider", "FRED"),
            "status": result.get("status"),
            "real_data": bool(result.get("real_data")),
            "rows": history_rows,
        }

    for config in derived_configs:
        history = []
        depends = config.get("depends_on", [])
        if config["id"] == "10y-2y-spread":
            history = _align_binary_history(raw_series.get("DGS10", {}).get("history", []), raw_series.get("DGS2", {}).get("history", []), lambda a, b: a - b)
        elif config["id"] == "10y-3m-spread":
            history = _align_binary_history(raw_series.get("DGS10", {}).get("history", []), raw_series.get("DGS3MO", {}).get("history", []), lambda a, b: a - b)
        elif config["id"] == "cpi-yoy":
            history = _cpi_yoy_history(raw_series.get("CPIAUCSL", {}).get("history", []))
        elif config["id"] == "real-10y-yield":
            history = raw_series.get("DFII10", {}).get("history", [])
        note = f"Derived from {', '.join(depends)}; context only, not scored."
        item = _derived_indicator(config, history, note=note)
        groups.setdefault(config.get("group", "Derived"), []).append(item)
        indicator_history["indicators"][config["id"]] = {
            "id": config["id"],
            "label": config.get("label", config["id"]),
            "name": config.get("name", config.get("label", config["id"])),
            "group": config.get("group"),
            "unit": config.get("unit", ""),
            "provider": "FRED",
            "status": "real" if history else "unavailable",
            "real_data": bool(history),
            "rows": [{"date": raw_date, "value": value} for raw_date, value in history],
        }

    real_count = sum(1 for result in raw_series.values() if result.get("real_data"))
    total = len(raw_series)
    indicator_history["real_data"] = any(item.get("real_data") for item in indicator_history["indicators"].values())
    indicator_history["status"] = "ok" if indicator_history["real_data"] and not warnings else "partial" if indicator_history["real_data"] else "warning"
    _CACHE = (groups, raw_series, warnings, real_count, total, indicator_history)
    return _CACHE


def fetch_macro_indicators(openbb_client=None):
    groups, series, warnings, real_count, total, _indicator_history = build_fred_macro_data()
    status = "ok" if real_count == total else "partial" if real_count else "warning"
    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "provider": "FRED",
        "status": status,
        "real_data": real_count > 0,
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
        "groups": groups,
    }


def fetch_indicator_history(openbb_client=None):
    return build_fred_macro_data()[5]
