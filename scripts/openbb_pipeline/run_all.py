import json
from datetime import datetime, timezone
from pathlib import Path

from fetch_macro_indicators import fetch_macro_indicators
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

    outputs = {
        "market_snapshot.json": fetch_market_snapshot(openbb_client),
        "macro_indicators.json": fetch_macro_indicators(openbb_client),
        "stress_indicators.json": fetch_stress_indicators(openbb_client),
    }

    for name, payload in outputs.items():
        warnings.extend(payload.get("warnings", []))
        write_json(name, payload)

    status = {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "warning" if warnings else "ok",
        "warnings": warnings,
        "providers": [
            {
                "name": "OpenBB",
                "status": "available" if openbb_client is not None else "unavailable",
                "note": "No paid API keys required for v0; fallback records are written when live fetches are not available.",
            }
        ],
    }
    write_json("pipeline_status.json", status)
    print("Macro-Watch pipeline complete.")


if __name__ == "__main__":
    main()
