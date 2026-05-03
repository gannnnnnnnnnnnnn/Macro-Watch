import json
from datetime import datetime, timezone
from pathlib import Path

from fetch_macro_indicators import fetch_macro_indicators
from fetch_market_history import fetch_market_history
from fetch_market_snapshot import fetch_market_snapshot
from fetch_stress_indicators import fetch_stress_indicators

ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "data" / "generated"


def get_openbb_client():
    try:
        from openbb import obb  # type: ignore

        print("OpenBB detected.")
        return obb, None
    except Exception as exc:
        message = f"OpenBB unavailable: {exc}"
        print(message)
        return None, message


def write_json(name, payload):
    GENERATED.mkdir(parents=True, exist_ok=True)
    path = GENERATED / name
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {path.relative_to(ROOT)}")


def main():
    print("Macro-Watch OpenBB pipeline starting.")
    openbb_client, openbb_warning = get_openbb_client()
    warnings = []
    if openbb_warning:
        warnings.append(openbb_warning)

    market_snapshot = fetch_market_snapshot(openbb_client)
    outputs = {
        "market_snapshot.json": market_snapshot,
        "market_history.json": fetch_market_history(openbb_client),
        "macro_indicators.json": fetch_macro_indicators(openbb_client),
        "stress_indicators.json": fetch_stress_indicators(openbb_client, market_snapshot),
    }

    file_status = {}
    for name, payload in outputs.items():
        warnings.extend(payload.get("warnings", []))
        file_status[name] = {
            "status": payload.get("status", "unknown"),
            "provider": payload.get("provider"),
            "real_data": bool(payload.get("real_data")),
            "warnings": payload.get("warnings", []),
            "series": payload.get("series", {}),
        }
        write_json(name, payload)

    market_assets = outputs["market_snapshot.json"].get("assets", [])
    market_history_symbols = outputs["market_history.json"].get("symbols", {})
    symbol_status = [
        {
            "symbol": asset.get("symbol"),
            "provider": asset.get("provider"),
            "status": asset.get("status"),
            "real_data": bool(asset.get("real_data")),
            "history_status": market_history_symbols.get(asset.get("symbol"), {}).get("status"),
            "history_rows": len(market_history_symbols.get(asset.get("symbol"), {}).get("rows", [])),
            "error": None if asset.get("status") == "ok" else asset.get("status"),
        }
        for asset in market_assets
    ]
    has_errors = any(item["status"] == "error" for item in file_status.values())
    has_warnings = bool(warnings) or any(item["status"] == "warning" for item in file_status.values())
    fred_series = {}
    for file_name in ("macro_indicators.json", "stress_indicators.json"):
        for series_id, item in file_status.get(file_name, {}).get("series", {}).items():
            fred_series[series_id] = item
    status = {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "error" if has_errors else "warning" if has_warnings else "ok",
        "warnings": warnings,
        "files": file_status,
        "symbols": symbol_status,
        "fred_series": fred_series,
        "providers": [
            {
                "name": "OpenBB",
                "status": "available" if openbb_client is not None else "unavailable",
                "note": "Uses yfinance through OpenBB for no-key market history when available.",
            },
            {
                "name": "yfinance",
                "status": "used" if any(item.get("provider") == "yfinance" for item in symbol_status) else "unused",
                "note": "Provider for first-pass market snapshot symbols.",
            },
            {
                "name": "FRED",
                "status": "used" if any(item.get("real_data") for item in fred_series.values()) else "unavailable",
                "note": "Fetched through pandas_datareader without API keys for first-pass macro and stress indicators.",
            }
        ],
    }
    write_json("pipeline_status.json", status)
    print("Macro-Watch pipeline complete.")


if __name__ == "__main__":
    main()
