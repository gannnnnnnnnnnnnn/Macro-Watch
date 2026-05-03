# Architecture

Macro-Watch v0 is intentionally small and local-first.

## Frontend

Next.js renders the cockpit pages and reads local JSON files on the server. It checks `data/generated` first and falls back to `data/mock` when generated data is missing, invalid, or incomplete.

## Data

The frontend expects:

- `market_snapshot.json`
- `macro_indicators.json`
- `stress_indicators.json`
- `pipeline_status.json` when generated

Missing fields must render as unavailable instead of crashing the UI.

## Pipeline

Python scripts under `scripts/openbb_pipeline` try to fetch data through OpenBB when installed. If OpenBB or live data is unavailable, scripts write generated fallback files with warnings so the app still has a consistent local data path.

## Avoided in v0

No ORM, database, auth, backend service, deployment setup, Trader Reader, AI features, broker integration, or thesis validation.
