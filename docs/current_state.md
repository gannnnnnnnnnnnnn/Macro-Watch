# Current State

## Current phase

Phase 2.1 Interactive Research Workbench is in progress on `feature/interactive-workbench`.

## Current runnable path

Next.js frontend reads `data/generated/*.json` first, then falls back to `data/mock/*.json`. Python OpenBB/FRED pipeline writes `data/generated/*.json`; generated JSON is local runtime output and is ignored by git except for `data/generated/.gitkeep`.

## What works

- v0.1 OpenStock/OpenBB-inspired dark local macro cockpit remains intact.
- Static config catalogs define enabled market assets, FRED indicators, derived indicators, and default pins.
- Dashboard shows pinned workbench items with detail links and neutral context only.
- Markets explorer uses config-driven groups, selected asset switching, local Lightweight Charts, and asset detail links.
- Asset detail pages show latest local snapshot data, local history chart, recent rows, and optional external TradingView reference.
- Indicator detail pages support raw FRED indicators and derived indicators such as CPI YoY, 10Y-2Y spread, and 10Y-3M spread.
- OpenBB/yfinance pipeline reads `config/assets.json` and writes expanded market snapshot/history.
- FRED pipeline reads `config/indicators.json`, writes macro/stress data, and adds `indicator_history.json` for charting.
- Data Lab shows catalog counts, generated file status, chart data status, provider status, warnings, and local refresh commands.

## Current stack

Next.js, TypeScript, Tailwind CSS v3, TradingView Lightweight Charts, local JSON files, embedded public TradingView widget panel, Python pipeline with OpenBB/yfinance market data plus FRED macro/stress data through `pandas_datareader` with no-key CSV fallback.

## Current data contract

Frontend consumes `market_snapshot.json`, `market_history.json`, `macro_indicators.json`, `stress_indicators.json`, `indicator_history.json`, and optional `pipeline_status.json`. Catalog inputs live in `config/assets.json`, `config/indicators.json`, and `config/pins.json`. Chart components use local generated/mock JSON only; the external TradingView widget remains reference-only.

## Out of scope

Trader Reader, AI chat, thesis validation, broker integration, deployment, database/auth, backend service, email automation, UI preference editor, and full macro regime scoring remain out of scope.

## Next phase candidates

After Phase 2.1 review: manual notes, refresh workflow polish, persisted watchlist preferences, richer indicator detail ergonomics, and later Trader Reader.
