# Architecture

Macro-Watch is intentionally local-first.

## Terminal Shell

v0.7 adds a top-level terminal shell layer. `lib/modules.ts` is the source of truth for active routes and future disabled modules. The left navigation rail renders from that registry, highlights the current module, keeps future modules visible without links, and points users to the Data Source Center for data status.

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
- Data Source Center on `/data-lab`

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

Phase 2.4/2.5 adds generated/mock foundation files:

- `coverage_summary.json` summarizes enabled/real/unavailable asset and indicator coverage.
- `signal_cards.json` stores transformed observations from local assets and indicators.
- `evidence_cards.json` stores deterministic evidence references generated from signal cards.
- `stress_engine.json` consumes signal cards and stores Stress Engine v1 diagnosis fields: bucket severity, momentum, drivers, counter-evidence, watch items, confirmation pairs, and disabled composite status.

These files extend the generated-first/mock-fallback contract. Stress Engine v1 remains context-only and auditable; it does not introduce a database, backend, AI analyst, news ingestion, composite stress score, or trading-signal layer.

Missing fields must render as unavailable instead of crashing the UI.

Normal research pages should avoid pipeline-console detail. Data Source Center is the diagnostics/control-tower home for source, provider, freshness, generated/mock, coverage, output files, refresh workflow, and warning details.

## DataHub-lite

DataHub-lite is a future topic/data contract, not a live service in v0.7. It gives future Dashboard, Markets, Macro, Stress, Evidence Library, Trader Reader, AI Research, and Cycle Atlas modules a shared vocabulary for local data topics such as `asset:snapshot:SPY`, `macro:fred:DGS10`, `stress:bucket:credit`, `signal:card:<id>`, and `evidence:card:<id>`.

The current source of truth remains generated/mock JSON. No database, live pub/sub, backend service, or connector editor is introduced by v0.7.

## Pipeline

Python scripts under `scripts/openbb_pipeline` try to fetch market data through OpenBB/yfinance and macro/stress data through FRED. If a symbol or series fails, the pipeline keeps that record with warning/unavailable status and continues.

`npm run data:refresh` wraps `scripts/refresh_data.sh` for local refreshes. It runs the same Python pipeline and writes ignored `data/generated/*.json`; the browser must be refreshed manually, and production builds should be rebuilt after refreshing data.

## Future Local Research Store

Phase 2.3 keeps persistence as design work only. Phase 2.5 adds generated evidence files, not editable research storage. Future local research files may live under `data/local/` for notes, watchlist overrides, article manifests, extracted claims, and AI run records. SQLite remains a later option only if JSON files become too awkward for local research workflows.

## Avoided

No ORM, database, auth, backend service, deployment setup, Trader Reader, AI features, broker integration, email automation, fake scoring, or thesis validation.
