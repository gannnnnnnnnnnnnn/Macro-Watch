from datetime import datetime, timezone

from catalog_utils import all_assets, all_indicators, enabled_assets, enabled_derived_indicators, enabled_indicators


def _group_counts(items, real_lookup):
    groups = {}
    for item in items:
        group = item.get("group") or "Unknown"
        entry = groups.setdefault(group, {"group": group, "enabled": 0, "real": 0, "unavailable": 0, "coverage": 0})
        if item.get("enabled"):
            entry["enabled"] += 1
            if real_lookup(item):
                entry["real"] += 1
            else:
                entry["unavailable"] += 1
    for entry in groups.values():
        entry["coverage"] = round(entry["real"] / entry["enabled"], 4) if entry["enabled"] else 0
    return sorted(groups.values(), key=lambda row: row["group"])


def build_coverage_summary(market_snapshot, macro_indicators, indicator_history):
    assets = all_assets()
    enabled = enabled_assets()
    asset_by_symbol = {asset.get("symbol"): asset for asset in market_snapshot.get("assets", [])}

    indicator_configs = enabled_indicators() + enabled_derived_indicators()
    all_indicator_configs = all_indicators()
    indicator_history_items = indicator_history.get("indicators", {})

    def asset_real(config):
        return bool(asset_by_symbol.get(config.get("symbol"), {}).get("real_data"))

    def indicator_real(config):
        return bool(indicator_history_items.get(config.get("id"), {}).get("real_data"))

    assets_real = sum(1 for item in enabled if asset_real(item))
    indicators_real = sum(1 for item in indicator_configs if indicator_real(item))
    warnings = []
    for item in enabled:
        record = asset_by_symbol.get(item.get("symbol"))
        if not record or not record.get("real_data"):
            warnings.append(f"Asset unavailable: {item.get('symbol')}")
    for item in indicator_configs:
        record = indicator_history_items.get(item.get("id"))
        if not record or not record.get("real_data"):
            warnings.append(f"Indicator unavailable: {item.get('id')}")

    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "ok" if not warnings else "partial",
        "assets": {
            "total": len(assets),
            "enabled": len(enabled),
            "real": assets_real,
            "unavailable": len(enabled) - assets_real,
            "groups": _group_counts(assets, asset_real),
        },
        "indicators": {
            "total": len(all_indicator_configs),
            "enabled": len(indicator_configs),
            "real": indicators_real,
            "unavailable": len(indicator_configs) - indicators_real,
            "groups": _group_counts(all_indicator_configs, indicator_real),
        },
        "warnings": warnings,
    }
