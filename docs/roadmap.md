# Roadmap

## v0.1 Local Macro Cockpit

Status: merged.

- Local-first market cockpit
- OpenStock/OpenBB-inspired dark UI
- Generated JSON data path
- Mock JSON fallback
- OpenBB/yfinance market snapshot and history
- FRED macro and partial stress context
- Data freshness and stale-state UX
- Markets page selected asset switching
- Data Lab operating page

## v0.2 Interactive Workbench + Product Polish

Status: merged to `main` and tagged `v0.2-interactive-workbench`.

- Config-driven asset and indicator catalogs
- Static default pins and localStorage pin controls
- Asset detail pages
- Indicator detail pages
- Local TradingView Lightweight Charts from generated JSON
- Chart time ranges and lightweight technical overlays
- EN / 中文 UI language toggle
- Coverage-aware stress radar visualization
- Local `npm run data:refresh` workflow
- Trader Reader future claim schema note only

## v0.3 Stress Engine Foundation

Status: merged to `main` and tagged `v0.3-stress-engine-foundation`.

- Transparent stress engine design doc
- Explicit Stress Radar limitations
- Future `stress_engine.json` output contract
- Bucket coverage, confidence, and directionality concepts
- Local research store design boundary
- No full scoring model, AI analyst, database, or Trader Reader ingestion

## v0.4 Macro Signal Evidence Foundation

Status: merged to `main` and tagged `v0.4-macro-signal-evidence-foundation`.

- Broader config-driven macro asset universe
- Broader FRED/derived macro indicator catalog
- Coverage summary generated/mock data contract
- Mechanical signal cards from local market/macro/stress data
- Deterministic evidence cards from signal cards
- Thin `stress_engine.json` skeleton consuming signal cards
- Read-only Evidence Library route

## v0.5 Research Navigation and Discovery

Status: merged to `main` and tagged `v0.5-research-navigation-discovery`.

- Faster Markets discovery after expanded asset coverage
- Asset search by symbol, name, group, proxy, and tags
- Group filters plus quick filters for Core, Pinned, and Recent assets
- Compact asset list near the selected chart
- Clearer macro change labels and number formatting
- Larger Dashboard stress radar preview
- No new data sources, pipeline changes, stress scores, AI, or Trader Reader work

## v0.6 Stress Engine v1 Diagnosis Layer

Status: merged to `main` and tagged `v0.6-stress-engine-v1`.

- Upgrade `stress_engine.json` from skeleton to diagnosis layer
- Context-only severity labels from available signal-card percentiles
- Directionality-aware momentum where recent signal-card changes are usable
- Mechanical drivers, counter-evidence, and watch items per bucket
- Light cross-bucket confirmation matrix
- `/stress` diagnosis UI and Data Lab stress-engine diagnostics
- Composite stress remains disabled
- No AI analyst, Trader Reader ingestion, news scraping, full score, or trading signals

## v0.7 Terminal Shell + Data Source Center

Status: merged to `main` and tagged `v0.7-terminal-shell-data-source-center`.

- Module registry for active and future modules
- Terminal-style left navigation shell
- Data Lab route reframed as Data Source Center
- Product vision doc
- DataHub-lite design contract
- Disabled future modules visible without routes

## v0.8 Stress Bucket Detail Pages

Status: merged to `main` and tagged `v0.8-stress-bucket-detail-pages`.

- Dedicated stress bucket detail pages such as `/stress/credit`, `/stress/liquidity`, and `/stress/banking`
- Better driver, counter-evidence, and watch-item drilldowns
- No composite stress score unless separately justified

## v0.9 Evidence-first Analytics Upgrade

Status: active.

- Richer evidence browsing and filtering
- Better signal/evidence traceability from research pages
- Keep evidence deterministic and auditable
- Evidence detail pages at `/library/[id]`

## v1.0 Research Workspace MVP

Status: planned.

- Local workspace layout for comparing modules
- Manual notes and saved research context
- No heavy dock manager or database by default

## v1.1 AI Mode Selector

Status: planned.

- Future AI modes that explain evidence
- No opaque hidden scoring or invented conclusions

## v1.2 Trader Reader MVP

Status: planned.

- Structured article and claim ingestion
- Claim schema grounded in auditable source material
- No broker actions or trading advice

## v1.3 Research Flow Builder

Status: planned.

- Future flow builder for repeatable research workflows
- No real node editor until the workflow need is proven

## Later

- Cycle Atlas
- More polished watchlist preferences
- Event calendar/news summaries
- Broker integration only if product scope changes
