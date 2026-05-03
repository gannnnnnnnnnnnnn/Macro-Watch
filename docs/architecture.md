# Architecture

Macro-Watch is intentionally local-first.

## Frontend

Next.js renders the cockpit pages and reads local JSON files on the server. It checks `data/generated` first and falls back to `data/mock` when generated data is missing, invalid, or incomplete.

Phase 2.1 adds an interactive workbench layer:

- `/assets/[symbol]` detail pages
- `/indicators/[id]` detail pages
- client-side selected asset exploration on `/markets`
- TradingView Lightweight Charts rendered from local JSON history

The public TradingView widget remains an optional external reference; it is not the primary charting path.

## Config

Static catalogs live under `config/`:

- `assets.json` controls tracked market assets and provider/TradingView mappings.
- `indicators.json` controls enabled FRED indicators and derived indicators.
- `pins.json` controls default dashboard pins.

Pins are static config for now. There is no database, auth, account model, or UI editor.

## Data

The frontend expects:

- `market_snapshot.json`
- `market_history.json`
- `macro_indicators.json`
- `stress_indicators.json`
- `indicator_history.json`
- `pipeline_status.json` when generated

Missing fields must render as unavailable instead of crashing the UI.

## Pipeline

Python scripts under `scripts/openbb_pipeline` try to fetch market data through OpenBB/yfinance and macro/stress data through FRED. If a symbol or series fails, the pipeline keeps that record with warning/unavailable status and continues.

## Avoided

No ORM, database, auth, backend service, deployment setup, Trader Reader, AI features, broker integration, email automation, fake scoring, or thesis validation.
