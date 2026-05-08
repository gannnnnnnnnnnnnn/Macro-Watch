from datetime import datetime, timezone


def _summary(card):
    if not card.get("real_data"):
        return "Signal unavailable; pipeline warning present or source data missing."
    if card.get("transforms", {}).get("percentile_5y") is None:
        return "Latest value available; history too short for 5Y percentile."
    return "Latest value available with 5Y context."


def build_evidence_cards(signal_cards):
    now = datetime.now(timezone.utc).isoformat()
    cards = []
    for signal in signal_cards.get("cards", []):
        source_id = signal.get("source_id")
        title = f"{signal.get('label', source_id)} evidence"
        cards.append({
            "id": f"evidence:{source_id}",
            "type": signal.get("type") if signal.get("type") in ("indicator", "asset") else "stress",
            "title": title,
            "module": signal.get("bucket", "unknown"),
            "summary": _summary(signal),
            "source_ids": [source_id],
            "time_range": "5Y context where history is available",
            "created_at": now,
            "updated_at": now,
            "evidence": [
                {
                    "kind": signal.get("type", "source"),
                    "label": signal.get("label", source_id),
                    "href": signal.get("href"),
                }
            ],
            "tags": [signal.get("bucket", "unknown"), signal.get("type", "source")],
            "status": signal.get("status", "unavailable"),
            "ai_generated": False,
            "interpretation_boundary": "Mechanical evidence reference only. No AI analysis, news ingestion, or trading advice.",
        })
    return {
        "source": "generated",
        "generated_at": now,
        "status": "ok" if cards else "warning",
        "real_data": any(signal.get("real_data") for signal in signal_cards.get("cards", [])),
        "warnings": [],
        "cards": cards,
    }
