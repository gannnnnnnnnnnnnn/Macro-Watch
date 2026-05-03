# Current State

## Current phase

v0.1 Local Macro Cockpit is ready for merge review on `feature/local-scaffold-v0`.

## Current runnable path

Next.js frontend reads `data/generated/*.json` first, then falls back to `data/mock/*.json`. Python OpenBB/FRED pipeline writes `data/generated/*.json`; generated JSON is local runtime output and is ignored by git except for `data/generated/.gitkeep`.

## What works

- OpenStock/OpenBB-inspired dark local macro cockpit with AppShell, sidebar navigation, and top status strip.
- Dashboard, Markets, Macro, Stress, and Data Lab pages render locally.
- Markets page supports selected asset switching, sparklines from local history JSON, and a public TradingView widget panel.
- OpenBB/yfinance pipeline writes market snapshot and recent market history for the tracked proxies.
- FRED macro/stress indicators are generated through `pandas_datareader` with no-key CSV fallback.
- Macro page shows real FRED values and neutral delta context where available.
- Stress page shows partial real context for VIX, credit, liquidity, and Treasury data without fake scores.
- Data Lab shows generated/mock source, pipeline status, providers, symbols, FRED series, warnings, commands, and freshness/stale state.
- UI tolerates missing generated data and falls back to mock JSON with unavailable/pending labels.

## Current stack

Next.js, TypeScript, Tailwind CSS v3, local JSON files, embedded public TradingView widget panel, Python pipeline with OpenBB/yfinance market snapshot and history fetches plus FRED macro/stress data through `pandas_datareader` with no-key CSV fallback.

## Current data contract

Frontend consumes `market_snapshot.json`, `market_history.json`, `macro_indicators.json`, `stress_indicators.json`, and optional `pipeline_status.json`. Market assets include latest close, previous close, percentage change, provider, per-symbol status, and `real_data`; market history includes recent daily OHLCV rows by symbol; macro indicators include FRED rates, inflation, labor, liquidity, credit series, and neutral delta context where available; stress buckets are partial, with real VIX, FRED credit/liquidity/Treasury context, and pending labels for unwired buckets. The UI shows generated/mock/mixed source, generated timestamp, and stale warnings when generated data is older than 24 hours.

## Out of scope

Trader Reader, AI chat, thesis validation, broker integration, deployment, database/auth, backend service, and full macro regime scoring remain out of scope for v0.1.

## Next phase candidates

Phase 2 candidates: pinned indicators, indicator detail page, refresh workflow, manual notes, watchlist preferences, and later Trader Reader once the cockpit remains stable in daily local use.
