# Architecture

Macro-Watch is intentionally local-first.

## Frontend

Next.js renders the cockpit pages and reads local JSON files on the server. It checks `data/generated` first and falls back to `data/mock` when generated data is missing, invalid, or incomplete.

Phase 2.1 adds an interactive workbench layer, and Phase 2.2 polishes that layer:

- `/assets/[symbol]` detail pages
- `/indicators/[id]` detail pages
- client-side selected asset exploration on `/markets`
- TradingView Lightweight Charts rendered from local JSON history
- chart time ranges sliced from local JSON
- lightweight frontend-computed overlays for market charts
- localStorage pin and language preferences
- coverage-aware stress radar visualization
- compact dashboard stress radar preview that links to the full `/stress` page

The public TradingView widget remains an optional external reference on asset detail pages; it is not the primary charting path.

## Config

Static catalogs live under `config/`:

- `assets.json` controls tracked market assets and provider/TradingView mappings.
- `indicators.json` controls enabled FRED indicators and derived indicators.
- `pins.json` controls default dashboard pins.

Pins use static config as defaults and localStorage for browser-side add/remove/reset. There is no database, auth, account model, or backend preference service.

## Data

The frontend expects:

- `market_snapshot.json`
- `market_history.json`
- `macro_indicators.json`
- `stress_indicators.json`
- `indicator_history.json`
- `pipeline_status.json` when generated

Phase 2.3 documents a future `stress_engine.json` contract, but that file is not implemented yet. The current Stress Radar still reads the existing stress, market history, and indicator history JSON.

Missing fields must render as unavailable instead of crashing the UI.

Normal research pages should avoid pipeline-console detail. Data Lab is the diagnostics home for source, provider, freshness, generated/mock, and warning details.

## Pipeline

Python scripts under `scripts/openbb_pipeline` try to fetch market data through OpenBB/yfinance and macro/stress data through FRED. If a symbol or series fails, the pipeline keeps that record with warning/unavailable status and continues.

`npm run data:refresh` wraps `scripts/refresh_data.sh` for local refreshes. It runs the same Python pipeline and writes ignored `data/generated/*.json`; the browser must be refreshed manually, and production builds should be rebuilt after refreshing data.

## Future Local Research Store

Phase 2.3 keeps persistence as design work only. Future local research files may live under `data/local/` for notes, watchlist overrides, article manifests, extracted claims, and AI run records. SQLite remains a later option only if JSON files become too awkward for local research workflows.

## Avoided

No ORM, database, auth, backend service, deployment setup, Trader Reader, AI features, broker integration, email automation, fake scoring, or thesis validation.
