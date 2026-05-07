import json
from datetime import datetime, timezone
from pathlib import Path

from build_coverage_summary import build_coverage_summary
from build_evidence_cards import build_evidence_cards
from build_signal_cards import build_signal_cards
from build_stress_engine import build_stress_engine
from catalog_utils import all_assets, all_indicators, enabled_assets, enabled_derived_indicators, enabled_indicators
from fetch_macro_indicators import fetch_indicator_history, fetch_macro_indicators
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
    market_history = fetch_market_history(openbb_client)
    macro_indicators = fetch_macro_indicators(openbb_client)
    indicator_history = fetch_indicator_history(openbb_client)
    stress_indicators = fetch_stress_indicators(openbb_client, market_snapshot)

    outputs = {
        "market_snapshot.json": market_snapshot,
        "market_history.json": market_history,
        "macro_indicators.json": macro_indicators,
        "stress_indicators.json": stress_indicators,
        "coverage_summary.json": None,
        "signal_cards.json": None,
        "evidence_cards.json": None,
        "stress_engine.json": None,
        "indicator_history.json": indicator_history,
    }

    builders = [
        ("coverage_summary.json", lambda: build_coverage_summary(market_snapshot, macro_indicators, indicator_history)),
        ("signal_cards.json", lambda: build_signal_cards(market_snapshot, market_history, macro_indicators, stress_indicators, indicator_history)),
        ("evidence_cards.json", lambda: build_evidence_cards(outputs["signal_cards.json"])),
        ("stress_engine.json", lambda: build_stress_engine(outputs["signal_cards.json"])),
    ]
    for name, builder in builders:
        try:
            outputs[name] = builder()
        except Exception as exc:
            warning = f"{name}: builder failed: {exc}"
            warnings.append(warning)
            print(warning)
            outputs[name] = {
                "source": "generated",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "status": "warning",
                "real_data": False,
                "warnings": [warning],
            }

    file_status = {}
    for name, payload in outputs.items():
        if payload is None:
            continue
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
    assets_all = all_assets()
    assets_enabled = enabled_assets()
    indicators_enabled = enabled_indicators()
    derived_enabled = enabled_derived_indicators()
    all_indicator_configs = all_indicators()
    coverage = outputs.get("coverage_summary.json") or {}
    asset_coverage = coverage.get("assets", {})
    indicator_coverage = coverage.get("indicators", {})
    status = {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "error" if has_errors else "warning" if has_warnings else "ok",
        "warnings": warnings,
        "files": file_status,
        "symbols": symbol_status,
        "fred_series": fred_series,
        "config": {
            "assets_total": len(assets_all),
            "assets_enabled": len(assets_enabled),
            "assets_disabled": len(assets_all) - len(assets_enabled),
            "assets_real": asset_coverage.get("real", sum(1 for item in symbol_status if item.get("real_data"))),
            "assets_unavailable": asset_coverage.get("unavailable"),
            "indicators_total": len(all_indicator_configs),
            "indicators_enabled": len(indicators_enabled) + len(derived_enabled),
            "derived_indicators_enabled": len(derived_enabled),
            "indicators_real": indicator_coverage.get("real"),
            "indicators_unavailable": indicator_coverage.get("unavailable"),
            "asset_groups": asset_coverage.get("groups", []),
            "indicator_groups": indicator_coverage.get("groups", []),
        },
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
