from datetime import datetime, timezone

TARGETS = [
    ("SPY", "S&P 500 proxy"),
    ("QQQ", "Nasdaq 100 proxy"),
    ("VIX", "VIX proxy"),
    ("UUP", "US dollar proxy"),
    ("TLT", "US10Y/Treasury proxy"),
    ("GLD", "Gold proxy"),
    ("USO", "Oil proxy"),
    ("BTC-USD", "Bitcoin"),
]


def _fallback_asset(symbol, name, warning):
    return {"symbol": symbol, "name": name, "value": None, "change": None, "status": warning}


def fetch_market_snapshot(openbb_client=None):
    warnings = []
    assets = []
    if openbb_client is None:
        warnings.append("OpenBB unavailable; wrote market fallback records.")
        assets = [_fallback_asset(symbol, name, "fallback: OpenBB unavailable") for symbol, name in TARGETS]
    else:
        warnings.append("OpenBB client detected, but v0 live market fetch is conservative; fallback records written.")
        assets = [_fallback_asset(symbol, name, "fallback: live fetch not wired in v0") for symbol, name in TARGETS]

    return {
        "source": "generated",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "warnings": warnings,
        "assets": assets,
        "watchlist": assets,
    }
