import csv
from datetime import date, datetime, timedelta, timezone
from io import StringIO
from urllib.parse import urlencode
from urllib.request import urlopen

FRED_SERIES = {
    "DGS10": {"name": "10-Year Treasury Constant Maturity Rate", "unit": "%"},
    "DGS2": {"name": "2-Year Treasury Constant Maturity Rate", "unit": "%"},
    "FEDFUNDS": {"name": "Effective Federal Funds Rate", "unit": "%"},
    "CPIAUCSL": {"name": "Consumer Price Index", "unit": "index"},
    "UNRATE": {"name": "Unemployment Rate", "unit": "%"},
    "WALCL": {"name": "Federal Reserve Total Assets", "unit": "USD millions"},
    "RRPONTSYD": {"name": "Overnight Reverse Repurchase Agreements", "unit": "USD billions"},
    "BAMLH0A0HYM2": {"name": "US High Yield OAS", "unit": "%"},
    "BAA10Y": {"name": "Baa Corporate Yield Spread vs 10Y", "unit": "%"},
}


def _fetch_fred_series(series_id, start=None):
    start_date = start or (date.today() - timedelta(days=430))
    try:
        from pandas_datareader import data as pdr

        frame = pdr.DataReader(series_id, "fred", start_date)
        values = frame[series_id].dropna()
        if values.empty:
            raise ValueError("FRED returned no non-null values")
        latest_date = values.index[-1].date().isoformat()
        latest_value = float(values.iloc[-1])
        return {
            "series_id": series_id,
            "value": latest_value,
            "latest_date": latest_date,
            "provider": "FRED",
            "real_data": True,
            "status": "real",
            "history": values,
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
            "history": None,
        }


def _history_values(history):
    if history is None:
        return []
    if isinstance(history, list):
        return history
    return [(idx.date().isoformat(), float(value)) for idx, value in history.items()]


def _delta_fields(result):
    values = _history_values(result.get("history"))
    if len(values) < 2:
        return {"previous_value": None, "delta": None, "delta_label": "Δ previous unavailable", "one_year_delta": None, "one_year_delta_label": "1Y change unavailable"}
    latest_value = values[-1][1]
    previous_value = values[-2][1]
    delta = latest_value - previous_value
    latest_date = datetime.fromisoformat(values[-1][0]).date()
    one_year_prior = next(
        (value for raw_date, value in reversed(values[:-1]) if (latest_date - datetime.fromisoformat(raw_date).date()).days >= 330),
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


def _indicator(name, unit, result, note):
    return {
        "name": name,
        "value": round(result["value"], 4) if isinstance(result.get("value"), float) else result.get("value"),
        "unit": unit,
        "latest_date": result.get("latest_date"),
        "provider": result.get("provider", "FRED"),
        "real_data": bool(result.get("real_data")),
        "status": result.get("status", "unavailable"),
        "note": note,
        **_delta_fields(result),
    }


def _derived_indicator(name, value, unit, latest_date, real_data, status, note, previous_value=None, delta=None, one_year_delta=None):
    return {
        "name": name,
        "value": round(value, 4) if isinstance(value, float) else value,
        "unit": unit,
        "latest_date": latest_date,
        "provider": "FRED",
        "real_data": real_data,
        "status": status,
        "note": note,
        "previous_value": round(previous_value, 4) if isinstance(previous_value, float) else previous_value,
        "delta": round(delta, 4) if isinstance(delta, float) else delta,
        "delta_label": f"Δ previous {delta:+.4f}" if isinstance(delta, float) else "Δ previous unavailable",
        "one_year_delta": round(one_year_delta, 4) if isinstance(one_year_delta, float) else one_year_delta,
        "one_year_delta_label": f"1Y change {one_year_delta:+.4f}" if isinstance(one_year_delta, float) else "1Y change unavailable",
    }


def _cpi_yoy(cpi_result):
    history = cpi_result.get("history")
    if history is None or len(history) < 13:
        return _derived_indicator("CPI YoY", None, "%", None, False, "unavailable: insufficient CPI history", "Calculated from CPIAUCSL latest value versus about 12 months prior.")
    latest = float(history[-1][1]) if isinstance(history, list) else float(history.iloc[-1])
    prior = float(history[-13][1]) if isinstance(history, list) else float(history.iloc[-13])
    if prior == 0:
        return _derived_indicator("CPI YoY", None, "%", None, False, "unavailable: prior CPI value is zero", "Calculated from CPIAUCSL latest value versus about 12 months prior.")
    value = ((latest / prior) - 1) * 100
    latest_date = history[-1][0] if isinstance(history, list) else history.index[-1].date().isoformat()
    previous = None
    if len(history) >= 14:
        prev_latest = float(history[-2][1]) if isinstance(history, list) else float(history.iloc[-2])
        prev_prior = float(history[-14][1]) if isinstance(history, list) else float(history.iloc[-14])
        previous = ((prev_latest / prev_prior) - 1) * 100 if prev_prior else None
    delta = value - previous if previous is not None else None
    return _derived_indicator("CPI YoY", value, "%", latest_date, True, "real", "Calculated from CPIAUCSL latest value versus about 12 months prior.", previous, delta)


def build_fred_macro_data():
    series = {series_id: _fetch_fred_series(series_id) for series_id in FRED_SERIES}
    warnings = [f"{series_id}: {result['status']}" for series_id, result in series.items() if not result.get("real_data")]

    dgs10 = series["DGS10"]
    dgs2 = series["DGS2"]
    if dgs10.get("real_data") and dgs2.get("real_data"):
        spread = float(dgs10["value"]) - float(dgs2["value"])
        dgs10_delta = _delta_fields(dgs10)
        dgs2_delta = _delta_fields(dgs2)
        previous_spread = None
        if dgs10_delta["previous_value"] is not None and dgs2_delta["previous_value"] is not None:
            previous_spread = dgs10_delta["previous_value"] - dgs2_delta["previous_value"]
        delta = spread - previous_spread if previous_spread is not None else None
        spread_indicator = _derived_indicator("10Y-2Y spread", spread, "pp", dgs10.get("latest_date"), True, "real", "DGS10 minus DGS2.", previous_spread, delta)
    else:
        spread_indicator = _derived_indicator("10Y-2Y spread", None, "pp", None, False, "unavailable: DGS10 or DGS2 missing", "DGS10 minus DGS2.")

    groups = {
        "Rates": [
            _indicator("10Y Treasury yield", "%", dgs10, "FRED DGS10."),
            _indicator("2Y Treasury yield", "%", dgs2, "FRED DGS2."),
            spread_indicator,
            _indicator("Effective fed funds", "%", series["FEDFUNDS"], "FRED FEDFUNDS."),
        ],
        "Inflation": [
            _indicator("CPI index", "index", series["CPIAUCSL"], "FRED CPIAUCSL."),
            _cpi_yoy(series["CPIAUCSL"]),
        ],
        "Labor": [
            _indicator("Unemployment rate", "%", series["UNRATE"], "FRED UNRATE."),
        ],
        "Liquidity": [
            _indicator("Fed total assets", "USD millions", series["WALCL"], "FRED WALCL."),
            _indicator("Overnight reverse repos", "USD billions", series["RRPONTSYD"], "FRED RRPONTSYD."),
        ],
        "Credit": [
            _indicator("High yield OAS", "%", series["BAMLH0A0HYM2"], "FRED BAMLH0A0HYM2."),
            _indicator("Baa spread vs 10Y", "%", series["BAA10Y"], "FRED BAA10Y."),
        ],
        "Dollar": [
            _derived_indicator("Dollar proxy", None, "", None, False, "pending", "Use UUP/DXY market proxy; direct macro dollar series not wired yet."),
        ],
        "Commodities": [
            _derived_indicator("Commodity macro proxy", None, "", None, False, "pending", "Use GLD/USO market proxies; direct macro commodity series not wired yet."),
        ],
    }

    real_count = sum(1 for result in series.values() if result.get("real_data"))
    total = len(series)
    return groups, series, warnings, real_count, total


def fetch_macro_indicators(openbb_client=None):
    groups, series, warnings, real_count, total = build_fred_macro_data()
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
