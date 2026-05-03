# Current State

## Current phase

v0.1 local macro cockpit closeout.

## Current runnable path

Next.js frontend reads `data/generated/*.json` first, then falls back to `data/mock/*.json`. Python OpenBB pipeline writes `data/generated/*.json`.

## Current stack

Next.js, TypeScript, Tailwind CSS, local JSON files, embedded public TradingView widget panel, Python pipeline with OpenBB/yfinance market snapshot and history fetches plus FRED macro/stress data through `pandas_datareader` with no-key CSV fallback.

## Current data contract

Frontend consumes `market_snapshot.json`, `market_history.json`, `macro_indicators.json`, `stress_indicators.json`, and optional `pipeline_status.json`. Market assets include latest close, previous close, percentage change, provider, per-symbol status, and `real_data`; market history includes recent daily OHLCV rows by symbol; macro indicators include FRED rates, inflation, labor, liquidity, credit series, and neutral delta context where available; stress buckets are partial, with real VIX, FRED credit/liquidity/Treasury context, and pending labels for unwired buckets. The UI shows generated/mock/mixed source, generated timestamp, and stale warnings when generated data is older than 24 hours.

## Next step

Start the next slice only after reviewing the v0.1 cockpit locally; likely next step is small historical context views, not new subsystems.
