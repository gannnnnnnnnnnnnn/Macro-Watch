# Current State

## Current phase

v0.7 Terminal Shell + Data Source Center has been merged to `main` and tagged as `v0.7-terminal-shell-data-source-center`. The active phase is v0.8 Stress Bucket Detail Pages.

## Current runnable path

Next.js frontend reads `data/generated/*.json` first, then falls back to `data/mock/*.json`. Python OpenBB/yfinance and FRED pipeline output is local runtime data and remains ignored by git except for `data/generated/.gitkeep`.

## What works

- Dashboard, Markets, Macro, Stress, Evidence Library, asset detail pages, and indicator detail pages are route-backed modules.
- The app uses local generated/mock JSON for market snapshots, market history, macro indicators, stress indicators, indicator history, coverage summary, signal cards, evidence cards, stress engine output, and optional pipeline status.
- Markets supports grouped asset discovery, search, quick filters, local charts, and asset detail links.
- Macro and Stress consume local indicator data with context-only framing.
- Stress Engine v1 provides severity, momentum, drivers, counter-evidence, watch items, and confirmation pairs while keeping composite stress disabled.
- Stress bucket detail pages let each bucket be inspected at `/stress/[bucket]` without turning the overview into one long report.
- Evidence Library is read-only and deterministic.
- Data Lab is becoming the Data Source Center: a user-facing control tower for generated/mock status, provider status, coverage, output files, refresh workflow, and warnings.
- UI language can toggle locally between English and Chinese for core interface labels.

## Current stack

Next.js, TypeScript, Tailwind CSS v3, TradingView Lightweight Charts, local JSON files, localStorage pins/language preference, embedded public TradingView widget reference on asset detail pages, and a Python data pipeline using OpenBB/yfinance plus FRED through `pandas_datareader` with no-key CSV fallback.

## Current data contract

Frontend consumes `market_snapshot.json`, `market_history.json`, `macro_indicators.json`, `stress_indicators.json`, `indicator_history.json`, `coverage_summary.json`, `signal_cards.json`, `evidence_cards.json`, `stress_engine.json`, and optional `pipeline_status.json`. Catalog inputs live in `config/assets.json`, `config/indicators.json`, and `config/pins.json`.

## Out of scope

Trader Reader ingestion, AI chat, AI analyst, thesis validation, broker integration, deployment, database/auth, backend service, email automation, news scraping, option wall/dealer gamma, trading signals, full macro/stress regime scoring, and Cycle Atlas implementation remain out of scope.

## Next phase candidates

v0.9 Evidence-first Analytics Upgrade, v1.0 Research Workspace MVP, v1.1 AI Mode Selector, v1.2 Trader Reader MVP, and v1.3 Research Flow Builder.
