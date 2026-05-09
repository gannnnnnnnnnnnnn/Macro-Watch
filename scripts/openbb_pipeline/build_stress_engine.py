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

CONFIRMATION_PAIRS = [
    ("credit_vs_volatility", "Credit vs Volatility", "credit", "volatility"),
    ("credit_vs_banking", "Credit vs Banking", "credit", "banking"),
    ("liquidity_vs_treasury", "Liquidity vs Treasury", "liquidity", "treasury"),
    ("leverage_vs_volatility", "Leverage vs Volatility", "leverage", "volatility"),
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


def _percentile(card):
    value = card.get("transforms", {}).get("percentile_5y")
    return value if isinstance(value, (int, float)) else None


def _severity(context_percentile):
    if context_percentile is None:
        return "unknown"
    if context_percentile < 0.50:
        return "low"
    if context_percentile < 0.70:
        return "watch"
    if context_percentile < 0.85:
        return "elevated"
    return "high"


def _change_signal(card):
    transforms = card.get("transforms", {})
    directionality = card.get("directionality") or "unknown"
    change = transforms.get("rolling_change_1m")
    if not isinstance(change, (int, float)):
        change = transforms.get("rolling_change_3m")
    if not isinstance(change, (int, float)):
        return "unknown"
    if abs(change) < 0.0001:
        return "flat"
    if directionality == "higher_is_tighter":
        return "tightening" if change > 0 else "easing"
    if directionality == "lower_is_tighter":
        return "tightening" if change < 0 else "easing"
    if directionality == "absolute_move_is_tighter":
        return "tightening"
    return "unknown"


def _momentum(cards):
    tightening = easing = flat = unknown = 0
    for card in cards:
        signal = _change_signal(card)
        if signal == "tightening":
            tightening += 1
        elif signal == "easing":
            easing += 1
        elif signal == "flat":
            flat += 1
        else:
            unknown += 1
    if tightening == easing == 0 and flat:
        return "flat"
    if tightening == easing == 0:
        return "unknown"
    if tightening > easing and easing == 0:
        return "tightening"
    if easing > tightening and tightening == 0:
        return "easing"
    if tightening != easing:
        return "tightening" if tightening > easing else "easing"
    return "mixed"


def _confidence(real_cards, candidate_coverage):
    if len(real_cards) >= 3 and candidate_coverage >= 0.6:
        return "high"
    if len(real_cards) >= 2 or candidate_coverage >= 0.4:
        return "medium"
    return "low"


def _indicator(card):
    transforms = card.get("transforms", {})
    return {
        "id": card.get("source_id"),
        "label": card.get("label"),
        "href": card.get("href"),
        "percentile_5y": transforms.get("percentile_5y"),
        "rolling_change_1m": transforms.get("rolling_change_1m"),
        "rolling_change_3m": transforms.get("rolling_change_3m"),
        "trend": transforms.get("trend"),
        "acceleration": transforms.get("acceleration"),
        "directionality": card.get("directionality"),
        "status": card.get("status"),
        "real_data": bool(card.get("real_data")),
    }


def _driver(card):
    transforms = card.get("transforms", {})
    pct = transforms.get("percentile_5y")
    change_signal = _change_signal(card)
    reasons = []
    if isinstance(pct, (int, float)) and pct >= 0.70:
        reasons.append("5Y percentile elevated")
    if change_signal == "tightening":
        reasons.append("recent change tightening")
    return {
        "source_id": card.get("source_id"),
        "label": card.get("label"),
        "href": card.get("href"),
        "reason": " and ".join(reasons) + "." if reasons else "Available signal is contributing context.",
        "percentile_5y": pct,
        "rolling_change_1m": transforms.get("rolling_change_1m"),
        "status": card.get("status"),
    }


def _counter_evidence(card):
    transforms = card.get("transforms", {})
    pct = transforms.get("percentile_5y")
    change_signal = _change_signal(card)
    if not card.get("real_data"):
        reason = "Signal card is unavailable or fallback."
    elif not isinstance(pct, (int, float)):
        reason = "History is too short for 5Y percentile context."
    elif pct < 0.40:
        reason = "Available context is low or not confirming."
    elif change_signal == "easing":
        reason = "Recent change is easing."
    elif change_signal == "unknown":
        reason = "Directionality is unavailable or context-dependent."
    else:
        reason = "Signal does not add elevated/tightening evidence."
    return {
        "source_id": card.get("source_id"),
        "label": card.get("label"),
        "href": card.get("href"),
        "reason": reason,
        "percentile_5y": pct,
        "status": card.get("status"),
    }


def _watch_items(candidate_coverage, real_cards, missing_candidates, severity, confidence, momentum, context_percentile):
    items = []
    if candidate_coverage < 0.4:
        items.append({"type": "coverage", "message": "Coverage is thin.", "severity": "watch"})
    if not real_cards:
        items.append({"type": "missing_data", "message": "No real signal cards wired.", "severity": "warning"})
    if len(missing_candidates) > 2:
        items.append({"type": "missing_data", "message": "Important candidate indicators are missing.", "severity": "watch"})
    if severity in {"elevated", "high"} and confidence == "low":
        items.append({"type": "conflict", "message": "Elevated context has low confidence.", "severity": "warning"})
    if momentum == "tightening" and isinstance(context_percentile, (int, float)) and context_percentile < 0.5:
        items.append({"type": "early_warning", "message": "Recent tightening is early but not elevated in history.", "severity": "info"})
    return items


def _confirmation_status(left, right):
    if not left or not right or left.get("context_percentile") is None or right.get("context_percentile") is None:
        return "insufficient"
    left_elevated = left.get("severity") in {"elevated", "high"}
    right_elevated = right.get("severity") in {"elevated", "high"}
    left_low = left.get("severity") in {"low", "watch"}
    right_low = right.get("severity") in {"low", "watch"}
    if (left_elevated and right_elevated) or (left_low and right_low):
        return "confirmed"
    if left_elevated != right_elevated:
        return "divergent"
    return "insufficient"


def _confirmation_pairs(bucket_map):
    pairs = []
    for pair_id, label, left_id, right_id in CONFIRMATION_PAIRS:
        left = bucket_map.get(left_id)
        right = bucket_map.get(right_id)
        status = _confirmation_status(left, right)
        if status == "confirmed":
            summary = f"{left_id.title()} and {right_id.title()} context are broadly aligned."
        elif status == "divergent":
            summary = f"{left_id.title()} and {right_id.title()} context are not confirming each other."
        else:
            summary = "Insufficient available context for comparison."
        pairs.append({"id": pair_id, "label": label, "status": status, "summary": summary})
    return pairs


def build_stress_engine(signal_cards):
    buckets = []
    warnings = []
    for bucket_id, label, candidates in BUCKETS:
        cards = _bucket_cards(signal_cards, bucket_id)
        filtered_missing_candidates = _missing_candidates(candidates, cards)
        real_cards = [card for card in cards if card.get("real_data")]
        percentiles = [_percentile(card) for card in real_cards]
        percentiles = [value for value in percentiles if isinstance(value, (int, float))]
        wired_coverage = round(len(real_cards) / max(1, len(cards)), 4) if cards else 0
        candidate_coverage = round(len(real_cards) / max(1, len(cards) + len(filtered_missing_candidates)), 4)
        context_percentile = round(sum(percentiles) / len(percentiles), 4) if percentiles else None
        severity = _severity(context_percentile)
        momentum = _momentum(real_cards)
        confidence = _confidence(real_cards, candidate_coverage)
        drivers = [
            _driver(card)
            for card in real_cards
            if (_percentile(card) is not None and _percentile(card) >= 0.70) or _change_signal(card) == "tightening"
        ][:5]
        counter_evidence = [
            _counter_evidence(card)
            for card in cards
            if (not card.get("real_data")) or (_percentile(card) is None) or (_percentile(card) < 0.40) or _change_signal(card) in {"easing", "unknown"}
        ][:5]
        if not real_cards:
            warnings.append(f"{label}: no real signal coverage")
        buckets.append({
            "id": bucket_id,
            "label": label,
            "status": "partial" if real_cards else "pending",
            "context_percentile": context_percentile,
            "severity": severity,
            "severity_note": "Severity is based on available signal-card percentiles only. It is not a full stress score.",
            "momentum": momentum,
            "momentum_note": "Momentum is derived from recent signal-card changes where directionality is available.",
            "coverage": candidate_coverage,
            "wired_coverage": wired_coverage,
            "candidate_coverage": candidate_coverage,
            "coverage_note": "wired_coverage uses currently wired signal cards; candidate_coverage also includes missing candidate indicators.",
            "confidence": confidence,
            "drivers": drivers,
            "counter_evidence": counter_evidence,
            "watch_items": _watch_items(candidate_coverage, real_cards, filtered_missing_candidates, severity, confidence, momentum, context_percentile),
            "indicators": [_indicator(card) for card in cards],
            "missing_candidate_indicators": filtered_missing_candidates,
            "warnings": [] if real_cards else [f"{label} bucket has no real signal cards yet."],
            "directionality_notes": "Context only; directionality must be reviewed before any composite model.",
            "interpretation_boundary": "Stress Engine v1 diagnosis layer. Not a final score, not a regime model, and not trading advice.",
        })

    bucket_map = {bucket["id"]: bucket for bucket in buckets}
    return {
        "source": "generated",
        "version": "stress-engine-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "method": "transparent_context_model_v1",
        "status": "partial",
        "warnings": warnings,
        "buckets": buckets,
        "confirmation": {
            "pairs": _confirmation_pairs(bucket_map),
            "warnings": [],
        },
        "composite": {
            "available": False,
            "reason": "Composite not enabled until bucket coverage, directionality, and validation are reviewed.",
        },
    }
