# Current State

## Current phase

Phase 2.2 Interactive Workbench polish is ready for user visual approval on `feature/interactive-workbench` as a follow-up to PR #1.

## Current runnable path

Next.js frontend reads `data/generated/*.json` first, then falls back to `data/mock/*.json`. Python OpenBB/FRED pipeline writes `data/generated/*.json`; generated JSON is local runtime output and is ignored by git except for `data/generated/.gitkeep`.

## What works

- v0.1 OpenStock/OpenBB-inspired dark local macro cockpit remains intact.
- Static config catalogs define enabled market assets, FRED indicators, derived indicators, and default pins.
- Dashboard uses localStorage-backed pins with default pins from `config/pins.json`, a compact market pulse, a compact stress radar preview, and a focused macro snapshot.
- Markets explorer is card/chart-first with grouped assets, selected asset switching, local Lightweight Charts, optional table view, and asset detail links.
- Asset detail pages show latest local snapshot data, chart range controls, optional technical overlays, recent rows, and a lower-priority external TradingView reference.
- Indicator detail pages support raw FRED indicators and derived indicators such as CPI YoY, 10Y-2Y spread, and 10Y-3M spread with chart range controls.
- Stress has a coverage-aware SVG radar hero using partial context only, not a full stress score; Dashboard uses a compact preview that links to `/stress`.
- UI language can toggle locally between English and Chinese for core interface labels.
- OpenBB/yfinance pipeline reads `config/assets.json` and writes expanded market snapshot/history with a longer market-history window.
- FRED pipeline reads `config/indicators.json`, writes macro/stress data, and adds `indicator_history.json` for charting.
- Data Lab shows catalog counts, generated file status, chart data status, provider status, warnings, local refresh commands, and the `npm run data:refresh` workflow.

## Current stack

Next.js, TypeScript, Tailwind CSS v3, TradingView Lightweight Charts, local JSON files, localStorage pins/language preference, embedded public TradingView widget reference on asset detail pages, Python pipeline with OpenBB/yfinance market data plus FRED macro/stress data through `pandas_datareader` with no-key CSV fallback.

## Current data contract

Frontend consumes `market_snapshot.json`, `market_history.json`, `macro_indicators.json`, `stress_indicators.json`, `indicator_history.json`, and optional `pipeline_status.json`. Catalog inputs live in `config/assets.json`, `config/indicators.json`, and `config/pins.json`. Chart components use local generated/mock JSON only; generated market history is now intended to support multi-year chart ranges.

## Out of scope

Trader Reader implementation, AI chat, thesis validation, broker integration, deployment, database/auth, backend service, email automation, and full macro regime scoring remain out of scope.

## Next phase candidates

After user visual approval: merge review, then manual notes, refresh workflow polish, watchlist preference editing, richer indicator detail ergonomics, and later Trader Reader.
