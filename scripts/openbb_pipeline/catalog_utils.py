import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read_config(name):
    path = ROOT / "config" / name
    return json.loads(path.read_text(encoding="utf-8"))


def all_assets():
    return read_config("assets.json").get("assets", [])


def enabled_assets():
    return [asset for asset in all_assets() if asset.get("enabled")]


def enabled_indicators():
    return [indicator for indicator in read_config("indicators.json").get("indicators", []) if indicator.get("enabled")]


def enabled_derived_indicators():
    return [indicator for indicator in read_config("indicators.json").get("derived", []) if indicator.get("enabled")]


def all_indicators():
    config = read_config("indicators.json")
    return config.get("indicators", []) + config.get("derived", [])
