from datetime import datetime, timezone


BUCKETS = [
    ("volatility", "Volatility", ["VIX", "VVIX", "MOVE"]),
    ("credit", "Credit", ["High yield OAS", "BBB OAS", "Baa spread vs 10Y", "leveraged loan spreads"]),
    ("liquidity", "Liquidity", ["Fed total assets", "Overnight reverse repos", "Reserve balances", "TGA"]),
    ("treasury", "Treasury", ["10Y Treasury yield", "2Y Treasury yield", "10Y-2Y spread", "MOVE", "auction metrics"]),
    ("banking", "Banking", ["KRE", "XLF", "bank deposits", "discount window"]),
    ("household", "Household", ["Unemployment rate", "Initial jobless claims", "delinquencies", "consumer credit"]),
    ("leverage", "Leverage", ["margin debt", "dealer positioning", "leverage proxies"]),
]


def _bucket_cards(signal_cards, bucket_id):
    aliases = {
        "treasury": {"treasury", "rates"},
        "banking": {"banking"},
        "household": {"household"},
    }.get(bucket_id, {bucket_id})
    return [card for card in signal_cards.get("cards", []) if card.get("bucket") in aliases]


def _norm(value):
    return str(value or "").strip().lower()


def _missing_candidates(candidates, cards):
    wired = set()
    for card in cards:
        wired.add(_norm(card.get("source_id")))
        wired.add(_norm(card.get("label")))
    return [candidate for candidate in candidates if _norm(candidate) not in wired]


def build_stress_engine(signal_cards):
    buckets = []
    warnings = []
    for bucket_id, label, missing_candidates in BUCKETS:
        cards = _bucket_cards(signal_cards, bucket_id)
        filtered_missing_candidates = _missing_candidates(missing_candidates, cards)
        real_cards = [card for card in cards if card.get("real_data")]
        percentiles = [card.get("transforms", {}).get("percentile_5y") for card in real_cards]
        percentiles = [value for value in percentiles if isinstance(value, (int, float))]
        wired_coverage = round(len(real_cards) / max(1, len(cards)), 4) if cards else 0
        candidate_coverage = round(len(real_cards) / max(1, len(cards) + len(filtered_missing_candidates)), 4)
        context_percentile = round(sum(percentiles) / len(percentiles), 4) if percentiles else None
        if not real_cards:
            warnings.append(f"{label}: no real signal coverage")
        buckets.append({
            "id": bucket_id,
            "label": label,
            "status": "partial" if real_cards else "pending",
            "context_percentile": context_percentile,
            "coverage": candidate_coverage,
            "wired_coverage": wired_coverage,
            "candidate_coverage": candidate_coverage,
            "coverage_note": "wired_coverage uses currently wired signal cards; candidate_coverage also includes missing candidate indicators.",
            "confidence": "medium" if len(real_cards) >= 2 else "low",
            "indicators": [
                {
                    "id": card.get("source_id"),
                    "label": card.get("label"),
                    "href": card.get("href"),
                    "percentile_5y": card.get("transforms", {}).get("percentile_5y"),
                    "status": card.get("status"),
                }
                for card in cards
            ],
            "missing_candidate_indicators": filtered_missing_candidates,
            "warnings": [] if real_cards else [f"{label} bucket has no real signal cards yet."],
            "directionality_notes": "Context only; directionality must be reviewed before any composite model.",
            "interpretation_boundary": "Stress engine skeleton only. Not a final score and not trading advice.",
        })

    return {
        "source": "generated",
        "version": "stress-engine-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "method": "transparent_context_model_skeleton",
        "status": "partial",
        "warnings": warnings,
        "buckets": buckets,
        "composite": {
            "available": False,
            "reason": "Composite not enabled until bucket coverage and directionality are reviewed.",
        },
    }
