# Roadmap

## v0.1 Local Macro Cockpit

Status: ready for merge review.

- Local-first market cockpit
- OpenStock/OpenBB-inspired dark UI
- Generated JSON data path
- Mock JSON fallback
- OpenBB/yfinance market snapshot and history
- FRED macro and partial stress context
- Data freshness and stale-state UX
- Markets page selected asset switching
- Data Lab operating page

## Phase 2.1: Interactive Research Workbench

Status: in PR #1 on `feature/interactive-workbench`.

- Config-driven asset catalog
- Config-driven macro/FRED indicator catalog
- Static pinned indicators
- Asset detail pages
- Indicator detail pages
- Local TradingView Lightweight Charts from generated JSON
- Expanded market and macro data catalog
- Data Lab catalog/chart status

## Phase 2.2: Product Polish Follow-up

Status: merged to `main` and tagged `v0.2-interactive-workbench`.

- Research-first information hierarchy with Data Lab as diagnostics home
- Consistent number/date formatting
- Explorer-first Markets page
- Chart time ranges and lightweight technical overlays
- Longer market history fetch window
- localStorage pin management
- EN / 中文 UI language toggle
- Coverage-aware stress radar visualization
- Compact Dashboard stress radar preview
- Local `npm run data:refresh` workflow
- Trader Reader future claim schema note only

## Phase 2.3: Stress Engine Foundation

Status: merged to `main` and tagged `v0.3-stress-engine-foundation`.

- Transparent stress engine design doc
- Explicit current Stress Radar limitations
- Future `data/generated/stress_engine.json` output contract
- Bucket coverage, confidence, and directionality concepts
- Local research store design boundary
- No full scoring model, AI analyst, database, or Trader Reader ingestion

## Phase 2.4: Macro Data Coverage Pack

Status: merged to `main` and tagged `v0.4-macro-signal-evidence-foundation`.

- Broader config-driven macro asset universe
- Broader FRED/derived macro indicator catalog
- Coverage summary generated/mock data contract
- Pipeline status coverage counts by asset and indicator group
- One failed asset or series must not break the full pipeline

## Phase 2.5: Signal and Evidence Foundation

Status: merged to `main` and tagged `v0.4-macro-signal-evidence-foundation`.

- Mechanical signal cards from local market/macro/stress data
- Deterministic evidence cards from signal cards
- Thin `stress_engine.json` skeleton consuming signal cards
- Read-only Evidence Library route
- No AI analyst, Trader Reader ingestion, news scraping, full scoring model, or trading signals

## Phase 2.6: Research Navigation and Discovery

Status: in progress on `feature/research-navigation-discovery`.

- Faster Markets discovery after expanded asset coverage
- Asset search by symbol, name, group, proxy, and tags
- Group filters plus quick filters for Core, Pinned, and Recent assets
- Compact asset list near the selected chart
- Clearer macro change labels and number formatting
- Slightly larger Dashboard stress radar preview
- No new data sources, pipeline changes, stress scores, AI, or Trader Reader work

## Phase 2: Daily Use Layer

- Refresh workflow
- Manual notes
- Watchlist preferences UI
- More polished watchlist preferences
- Richer historical context views

## Later

- Trader Reader
- AI-assisted research
- Thesis validation
- Broker integration
- Full macro regime scoring

## Previous v0 scaffold

- Local-first market cockpit
- OpenStock-inspired dark UI
- Generated JSON data path
- Mock JSON fallback
- OpenBB pipeline skeleton
