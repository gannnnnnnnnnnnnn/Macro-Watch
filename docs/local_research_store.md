# Local Research Store

Macro-Watch remains local-first. The current storage model is file-based plus browser-local preferences.

## Current Storage

- `config/*.json`: static asset, indicator, and default pin catalogs.
- `data/generated/*.json`: ignored local pipeline output used first by the frontend.
- `data/mock/*.json`: committed fallback demo data used when generated data is unavailable.
- localStorage: browser-local pins and UI language preference.

There is no database, auth, account model, backend service, deployment requirement, or remote synchronization.

## Future File Store

When daily research workflows need local persistence, start with simple local files before reaching for a database:

- `data/local/notes.json`: manual notes and observations.
- `data/local/watchlist_overrides.json`: local watchlist/group/pin overrides.
- `data/local/trader_articles_manifest.json`: future article file inventory only.
- `data/local/trader_claims.json`: future extracted article claims.
- `data/local/ai_runs.json`: future local AI run metadata and outputs, if AI is added later.

These files should stay local, auditable, and easy to inspect. They should not replace the generated-first/mock-fallback data contract. Phase 2.5 generated evidence cards are deterministic pipeline output, not editable local notes.

## Future SQLite Boundary

SQLite may become useful only when JSON files become awkward to query or update safely. Candidate tables:

- articles
- claims
- outcomes
- notes
- observations
- ai analyses

Do not implement SQLite in the Phase 2.3 foundation PR. The next step is to design the contracts and keep the local cockpit runnable.

## Trader Reader Boundary

Trader Reader ingestion is still future work. The local store can reserve names for article manifests and claims, but this PR should not parse PDFs, ingest articles, create AI summaries, or validate theses.
