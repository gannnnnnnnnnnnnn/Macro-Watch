# Current State

## Current phase

Local market cockpit with first-pass FRED macro/stress data.

## Current runnable path

Next.js frontend reads `data/generated/*.json` first, then falls back to `data/mock/*.json`. Python OpenBB pipeline writes `data/generated/*.json`.

## Current stack

Next.js, TypeScript, Tailwind CSS, local JSON files, Python pipeline with OpenBB/yfinance market snapshot and history fetches plus FRED macro/stress data through `pandas_datareader` with no-key CSV fallback.

## Current data contract

Frontend consumes `market_snapshot.json`, `market_history.json`, `macro_indicators.json`, `stress_indicators.json`, and optional `pipeline_status.json`. Market assets include latest close, previous close, percentage change, provider, per-symbol status, and `real_data`; market history includes recent daily OHLCV rows by symbol; macro indicators include FRED rates, inflation, labor, liquidity, and credit series where available; stress buckets are partial, with real FRED credit/liquidity/Treasury context and pending labels for unwired buckets.

## Next step

Use the real macro/stress series to add richer context views without pretending the stress radar is complete.
