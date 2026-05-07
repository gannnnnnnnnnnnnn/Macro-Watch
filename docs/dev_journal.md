# Dev Journal

Append-only lightweight project journal.

## 2026-05-03 13:04 Australia/Melbourne

- task: Create initial local Macro-Watch v0 scaffold.
- files changed: `AGENTS.md`, `README.md`, `.gitignore`, `.agents/skills/update-dev-docs/SKILL.md`, `.agents/skills/publish-review-checkpoint/SKILL.md`, `docs/current_state.md`, `docs/dev_journal.md`, `docs/roadmap.md`, `docs/architecture.md`, `package.json`, `package-lock.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `next-env.d.ts`, `app/**`, `components/**`, `lib/**`, `data/mock/**`, `data/generated/.gitkeep`, `scripts/openbb_pipeline/**`.
- what changed: Added workflow docs, local Next.js/TypeScript/Tailwind cockpit pages, file-based generated-first/mock-fallback data loading, mock market/macro/stress data, and an OpenBB-aware pipeline skeleton that writes generated fallback data with warnings.
- validation: `npm install` passed; `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`; `python3 -m venv .venv` passed; `pip install -r requirements.txt` passed; `python run_all.py` passed and wrote generated JSON plus `pipeline_status.json`.
- notes/risks: `npm install` reported two moderate audit findings. OpenBB installed locally, but v0 live fetches are intentionally conservative and currently write generated fallback records with warning status.
- next: Replace fallback pipeline records with real no-paid-key OpenBB fetches and add chart rendering once the data contract settles.
- commit hash if available: `27a89a1`

## 2026-05-03 13:36 Australia/Melbourne

- task: Wire first OpenBB real data pipeline.
- files changed: `scripts/openbb_pipeline/fetch_market_snapshot.py`, `scripts/openbb_pipeline/fetch_macro_indicators.py`, `scripts/openbb_pipeline/fetch_stress_indicators.py`, `scripts/openbb_pipeline/run_all.py`, `app/data-lab/page.tsx`, `components/Cockpit.tsx`, `lib/types.ts`, `docs/current_state.md`, `docs/dev_journal.md`.
- what changed: Replaced market fallback-only behavior with real OpenBB historical fetches using yfinance for SPY, QQQ, VIX via `^VIX`, UUP, TLT, GLD, USO, and BTC-USD; added per-symbol status/error handling; expanded `pipeline_status.json` with per-file and per-symbol status; kept macro and stress as clearly labeled placeholders; surfaced provider, file, and symbol status in Data Lab.
- validation: `npm run build` initially failed on a Data Lab TypeScript fallback tuple inference issue, then passed after the type fix; `python3 -m venv .venv` was not needed because `.venv` already existed; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed and fetched real yfinance data through OpenBB for all market symbols; final `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`.
- notes/risks: OpenBB real market fetch worked locally for all requested market proxies. No unavailable market symbols in local validation. Overall pipeline status is `warning` because macro and stress files are still placeholder/unavailable by design.
- next: Add the first real no-key macro or stress indicator source, then consider simple market history charts.
- commit hash if available: `e83b886`

## 2026-05-03 14:03 Australia/Melbourne

- task: Polish market cockpit and add history data.
- files changed: `scripts/openbb_pipeline/fetch_market_history.py`, `scripts/openbb_pipeline/run_all.py`, `data/mock/market_history.json`, `lib/data.ts`, `lib/types.ts`, `components/Cockpit.tsx`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `app/markets/page.tsx`, `app/macro/page.tsx`, `app/stress/page.tsx`, `app/data-lab/page.tsx`, `docs/current_state.md`, `docs/dev_journal.md`.
- what changed: Added generated/mock `market_history.json` support, exported 60 recent daily rows per symbol through OpenBB/yfinance, included history status in `pipeline_status.json`, added SVG sparklines to market cards and tables, strengthened the home dashboard/regime strip, upgraded market detail and watchlist views, and made macro/stress placeholders and Data Lab warnings more intentional.
- validation: First `npm run build` passed; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed; final `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`.
- notes/risks: Market history real fetch worked locally for SPY, QQQ, VIX via `^VIX`, UUP, TLT, GLD, USO, and BTC-USD with 60 rows each. No unavailable market history symbols. Overall pipeline status remains `warning` because macro and stress files are still placeholder/unavailable by design.
- next: Add one real no-key macro or stress data source, then refine historical chart interactions around the existing local JSON contract.
- commit hash if available: `67fa47f`

## 2026-05-03 14:28 Australia/Melbourne

- task: Wire first FRED macro indicators.
- files changed: `scripts/openbb_pipeline/requirements.txt`, `scripts/openbb_pipeline/fetch_macro_indicators.py`, `scripts/openbb_pipeline/fetch_stress_indicators.py`, `scripts/openbb_pipeline/run_all.py`, `lib/types.ts`, `components/Cockpit.tsx`, `app/macro/page.tsx`, `app/stress/page.tsx`, `app/data-lab/page.tsx`, `docs/current_state.md`, `docs/dev_journal.md`.
- what changed: Added `pandas_datareader` plus a no-key FRED CSV fallback, generated real FRED macro indicators for rates, CPI, unemployment, Fed assets, reverse repos, and credit spreads, calculated 10Y-2Y spread and CPI YoY, made stress buckets partial with real credit/liquidity/Treasury context, added per-series FRED status to `pipeline_status.json`, and surfaced provider/date/real-vs-pending labels in Macro, Stress, and Data Lab.
- validation: First `npm run build` failed on a typed fallback tuple in Data Lab, then passed after the type fix; `pip install -r requirements.txt` installed `pandas_datareader`; `python run_all.py` passed; `pandas_datareader` failed locally because Python lacked `distutils`, then the FRED CSV fallback fetched real data; final `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`.
- notes/risks: FRED series worked locally for `DGS10`, `DGS2`, `FEDFUNDS`, `CPIAUCSL`, `UNRATE`, `WALCL`, `RRPONTSYD`, `BAMLH0A0HYM2`, and `BAA10Y`. No FRED series failed after CSV fallback. Stress remains partial by design because volatility, banking, household, and leverage buckets are not fully wired.
- next: Add historical context or simple deltas for FRED series, then wire VIX snapshot into volatility stress without creating fake scores.
- commit hash if available: `367b63e`

## 2026-05-03 14:55 Australia/Melbourne

- task: Polish cockpit shell and data views.
- files changed: `components/AppShell.tsx`, `components/TradingViewWidget.tsx`, `components/Cockpit.tsx`, `app/layout.tsx`, `app/page.tsx`, `app/markets/page.tsx`, `app/macro/page.tsx`, `app/stress/page.tsx`, `app/data-lab/page.tsx`, `docs/current_state.md`, `docs/dev_journal.md`.
- what changed: Added a reusable app shell with sidebar navigation and top status strip, upgraded the dashboard with generated-data freshness, market pulse, macro snapshot, and stress snapshot, expanded Markets with selected asset detail and a public TradingView embed, improved Macro and Stress views around real/pending badges, and reshaped Data Lab into an operations-style page with files, providers, market symbols, FRED series, warnings, commands, and source contract.
- validation: `npm run build` failed once on a Data Lab file warning type, then passed after the type fix; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed; final `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`.
- notes/risks: TradingView widget was added as a client-only public embed, not the proprietary Charting Library; if its external script fails, the widget shows a fallback card. UI remains server-rendered around local JSON and still has no interactive selected-symbol state beyond the first generated asset. Stress remains partial and not scored.
- next: Add lightweight client-side selected asset switching on Markets, then wire VIX into volatility stress while keeping labels honest.
- commit hash if available: `f58950b`

## 2026-05-03 15:21 Australia/Melbourne

- task: Add market selection and VIX stress context.
- files changed: `components/MarketsClient.tsx`, `components/TradingViewWidget.tsx`, `app/markets/page.tsx`, `app/page.tsx`, `app/data-lab/page.tsx`, `scripts/openbb_pipeline/fetch_stress_indicators.py`, `scripts/openbb_pipeline/run_all.py`, `docs/current_state.md`, `docs/dev_journal.md`.
- what changed: Added client-side selected asset switching for Markets without global state, made watchlist rows selectable with selected-row highlighting, updated selected asset detail/sparkline/TradingView widget from the selected symbol, expanded TradingView symbol mapping for UUP and TLT, passed market snapshot data into stress generation, and wired real VIX from OpenBB/yfinance into the Volatility stress bucket without creating a score.
- validation: `npm run build` passed; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed; generated `stress_indicators.json` contains real VIX value/status/provider; final `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`.
- notes/risks: Selected asset switching works as a client component on `/markets` and defaults to the first generated asset. VIX stress wiring worked locally with VIX from yfinance/OpenBB. TradingView mapping uses `NASDAQ:TLT`, which is the common TradingView embed symbol; external widget loading can still fail independently of the local app.
- next: Add small historical delta views for FRED and VIX context, still without fake scoring.
- commit hash if available: `f2cb0ed`

## 2026-05-03 15:48 Australia/Melbourne

- task: Harden v0.1 local cockpit.
- files changed: `scripts/openbb_pipeline/fetch_macro_indicators.py`, `lib/freshness.ts`, `lib/types.ts`, `components/AppShell.tsx`, `components/Cockpit.tsx`, `app/page.tsx`, `app/macro/page.tsx`, `app/stress/page.tsx`, `app/data-lab/page.tsx`, `docs/current_state.md`, `docs/dev_journal.md`, `docs/roadmap.md`.
- what changed: Added generated-data freshness and stale warning helpers, surfaced freshness in the top status strip, sidebar, dashboard, and Data Lab, added neutral FRED delta fields (`previous_value`, `delta`, `delta_label`, `one_year_delta`) where history supports them, showed delta context in macro/stress indicators and metric tiles, tightened Data Lab operating summary, and updated milestone docs for v0.1.
- validation: `npm run build` passed; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed; final `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`. `npm run dev` was not run because it was optional and build/pipeline validation covered the checkpoint.
- notes/risks: UI now warns when generated data is older than 24 hours. Delta fields are context only and do not imply good/bad or regime scoring. Empty/missing data paths continue to render unavailable, pending, or run-pipeline states.
- next: Review v0.1 locally, then add small historical context views only if the current cockpit feels solid.
- commit hash if available: `4fa929e`

## 2026-05-03 18:46 Australia/Melbourne

- task: Fix Tailwind styling and rescue cockpit UI.
- files changed: `package.json`, `package-lock.json`, `postcss.config.mjs`, `app/globals.css`, `components/AppShell.tsx`, `app/page.tsx`, `app/data-lab/page.tsx`, `docs/current_state.md`, `docs/dev_journal.md`.
- what changed: Restored the styling pipeline to stable Tailwind v3 by pinning `tailwindcss` to `3.4.17`, pinning PostCSS/autoprefixer versions, removing the Tailwind v4-only `@tailwindcss/postcss` plugin dependency, and switching PostCSS config back to the v3 `tailwindcss` plugin. Added global sans-serif/link/table/form defaults and made a focused visual rescue pass on the top status strip, dashboard hero/focus grid, and Data Lab summary grid.
- validation: `npm install` passed and updated the lockfile; first `npm run build` passed; generated CSS was checked for utilities including `grid`, `border-line`, `bg-panel`, and `text-slate-*`; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed and fetched/wrote market, macro, stress, history, and pipeline status data; final `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`; `npm run dev` started on port 3001 because port 3000 was in use, and all five app routes returned HTTP 200.
- notes/risks: Root cause was dependency drift to Tailwind v4 plus the v4 PostCSS plugin while the project uses a Tailwind v3 config/content/custom-color setup. `npm install` still reports two moderate audit findings. Visual rescue was intentionally focused and did not add new features, pages, data sources, or scoring.
- next: Run the dev server and visually review all five pages; then keep the next slice small and local-first.
- commit hash if available: `9f2cd3d`

## 2026-05-03 19:10 Australia/Melbourne

- task: Finalize v0.1 Local Macro Cockpit checkpoint.
- files changed: `docs/current_state.md`, `docs/dev_journal.md`, `docs/roadmap.md`, `README.md`.
- what changed: Marked v0.1 Local Macro Cockpit as ready for merge review, clarified working scope and explicit out-of-scope items, added Phase 2 Daily Use Layer candidates, and tightened README notes around generated JSON, mock fallback, and running the local pipeline for real data.
- validation: `npm run build` passed; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed and wrote generated market, history, macro, stress, and pipeline status JSON; final `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`. Optional `npm run dev` was not rerun for this docs-only checkpoint.
- notes/risks: No feature, UI, or data-source changes in this checkpoint.
- next: Merge review for v0.1, then choose one small Phase 2 daily-use slice.
- commit hash if available: `a4c266e`

## 2026-05-03 19:29 Australia/Melbourne

- task: Add Phase 2.1 Interactive Research Workbench.
- files changed: `config/assets.json`, `config/indicators.json`, `config/pins.json`, `scripts/openbb_pipeline/**`, `data/mock/indicator_history.json`, `lib/data.ts`, `lib/types.ts`, `lib/routes.ts`, `components/LightweightChart.tsx`, `components/MarketsClient.tsx`, `components/Cockpit.tsx`, `components/TradingViewWidget.tsx`, `app/page.tsx`, `app/markets/page.tsx`, `app/assets/[symbol]/page.tsx`, `app/indicators/[id]/page.tsx`, `app/macro/page.tsx`, `app/stress/page.tsx`, `app/data-lab/page.tsx`, `package.json`, `package-lock.json`, `README.md`, `docs/current_state.md`, `docs/dev_journal.md`, `docs/roadmap.md`, `docs/architecture.md`.
- what changed: Added config-driven asset, indicator, and pin catalogs; expanded OpenBB/yfinance market snapshot and one-year history fetches from the asset catalog; expanded FRED macro/stress fetches from the indicator catalog; added generated/mock `indicator_history.json`; added dashboard pins, market group filtering, asset detail pages, indicator detail pages, and local Lightweight Charts using generated JSON.
- validation: `npm install` installed `lightweight-charts`; first `npm run build` failed because a client component imported server-only `fs` through `lib/data.ts`, then passed after moving route helpers to `lib/routes.ts`; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed with 28 enabled assets, 28 market history entries, 24 enabled FRED indicators, 3 derived indicators, and `pipeline_status.status` `ok`; final `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, `/data-lab`, 28 asset detail pages, and 27 indicator detail pages; mock-fallback build also passed with generated JSON temporarily moved aside; existing `npm run dev` server on port 3000 returned HTTP 200 for `/`, `/markets`, `/assets/SPY`, `/indicators/DGS10`, and `/data-lab`.
- notes/risks: Pins are static config only; no database/auth/preference editor exists. Charts use local JSON and Lightweight Charts; external TradingView remains reference-only. No scoring, AI, Trader Reader, broker integration, or backend service was added.
- next: Visual review the workbench pages, then consider a small refresh workflow or manual notes slice.
- commit hash if available: `65d7ffc`

## 2026-05-03 19:48 Australia/Melbourne

- task: Visual QA for interactive workbench.
- files changed: `app/globals.css`, `app/page.tsx`, `app/data-lab/page.tsx`, `app/assets/[symbol]/page.tsx`, `app/indicators/[id]/page.tsx`, `components/AppShell.tsx`, `components/Cockpit.tsx`, `components/LightweightChart.tsx`, `components/MarketsClient.tsx`, `docs/dev_journal.md`.
- what changed: Tightened mobile status strip layout, prevented horizontal overflow, kept source/status badges compact, added spacing around new workbench sections, aligned selected asset state with the active market group filter, formatted asset detail table numbers, and made empty chart states respect chart height.
- validation: `npm run build` passed; visual screenshots checked Dashboard, Markets, `/assets/SPY`, `/indicators/cpi-yoy`, and mobile `/data-lab`; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed for the expanded asset/indicator catalog; final `npm run build` passed and prerendered the cockpit plus asset and indicator detail pages.
- notes/risks: External TradingView reference widgets can still show their own loading state independently of local Lightweight Charts. No feature, data contract, scoring, AI, Trader Reader, or backend changes were added.
- next: Continue PR visual review on real browser/device before merge.
- commit hash if available: `4934a42`

## 2026-05-03 23:33 Australia/Melbourne

- task: Phase 2.2 polish interactive workbench UX.
- files changed: `components/AppShell.tsx`, `components/ShellNav.tsx`, `components/LanguageProvider.tsx`, `components/PinsClient.tsx`, `components/LightweightChart.tsx`, `components/MarketsClient.tsx`, `components/StressRadarClient.tsx`, `components/Cockpit.tsx`, `app/page.tsx`, `app/markets/page.tsx`, `app/assets/[symbol]/page.tsx`, `app/indicators/[id]/page.tsx`, `app/macro/page.tsx`, `app/stress/page.tsx`, `app/data-lab/page.tsx`, `lib/format.ts`, `lib/data.ts`, `scripts/openbb_pipeline/fetch_market_history.py`, `scripts/qa/route_smoke.mjs`, `package.json`, `package-lock.json`, `README.md`, `docs/current_state.md`, `docs/roadmap.md`, `docs/architecture.md`, `docs/trader_reader_design.md`.
- what changed: Cleaned normal page information hierarchy by moving operational metadata toward Data Lab, added shared number/date formatting, redesigned Markets into an explorer-first page, added chart range controls and lightweight technical overlays, added localStorage pin management, added an EN / 中文 interface toggle, extended market history fetches to roughly five years, added a coverage-aware SVG stress radar, added route smoke QA, and documented a future Trader Reader claim schema without implementing ingestion.
- validation: `npm install` passed with dependencies already up to date and `lightweight-charts` pinned; `npm run build` passed before pipeline validation; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed and fetched 28 market snapshots plus longer history; final `npm run build` passed; mock fallback build passed with generated JSON temporarily moved aside and restored; `npm run dev` started on port 3000; `npm run qa:routes` returned HTTP 200 for `/`, `/markets`, `/assets/SPY`, `/assets/NVDA`, `/assets/BTC-USD`, `/indicators/DGS10`, `/indicators/cpi-yoy`, `/stress`, and `/data-lab`.
- notes/risks: `npm install` still reports two moderate audit findings. Stress radar is context-percentile based and partial, not a complete stress score. Language coverage targets core interface labels; some longer technical notes remain English. Pin state is browser-local only and does not mutate config files.
- next: User should visually review the listed routes before merge, especially Markets, asset details, indicator details, Stress radar, and mobile Data Lab.
- commit hash if available: Pending; current commit hash backfill deferred.

## 2026-05-03 23:43 Australia/Melbourne

- task: Final polish interactive workbench PR.
- files changed: `app/page.tsx`, `app/markets/page.tsx`, `app/assets/[symbol]/page.tsx`, `app/indicators/[id]/page.tsx`, `app/stress/page.tsx`, `components/LanguageProvider.tsx`, `components/MarketsClient.tsx`, `components/PinsClient.tsx`, `docs/current_state.md`, `docs/dev_journal.md`, `docs/roadmap.md`.
- what changed: Softened Dashboard copy away from diagnostics, made Data Lab the diagnostics home, moved Stress Radar to the top of the Stress page, collapsed the full stress bucket list behind a secondary section, made pin buttons aware of default pins when localStorage has not been initialized, expanded the local EN / 中文 dictionary, and kept Markets/asset/indicator pin actions aligned with default pins.
- validation: `npm install` passed with dependencies already up to date; `npm run build` passed; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed and fetched 28 market snapshots plus five-year market history; final `npm run build` passed; mock fallback build passed with generated JSON temporarily moved aside and restored; `npm run dev` started on port 3000; `npm run qa:routes` returned HTTP 200 for `/`, `/markets`, `/assets/SPY`, `/assets/NVDA`, `/assets/BTC-USD`, `/indicators/DGS10`, `/indicators/cpi-yoy`, `/stress`, and `/data-lab`.
- notes/risks: PR body was updated to include Phase 2.2 follow-up scope and validation. `npm install` still reports two moderate audit findings. Stress radar remains partial context only, not a full score. Pin and language preferences remain localStorage-only.
- next: User visual approval on Dashboard, Markets, asset details, indicator details, Stress, and Data Lab before merge.
- commit hash if available: Pending; current commit hash backfill deferred.

## 2026-05-04 00:24 Australia/Melbourne

- task: Fix hydration issues and clarify stress radar.
- files changed: `components/MarketsClient.tsx`, `components/PinsClient.tsx`, `components/StressRadarClient.tsx`, `components/LanguageProvider.tsx`, `docs/dev_journal.md`.
- what changed: Fixed invalid nested interactive HTML by replacing the Markets asset-card wrapper `<button>` with a keyboard-accessible non-button container and by changing pinned cards from whole-card links with nested remove buttons to normal cards with separate detail links. Clarified Stress Radar wording as context percentile only, partial coverage, provisional directions, and not a complete stress score. Increased radar SVG padding/reduced label size to avoid clipped labels and added modest Chinese dictionary labels.
- validation: `npm run build` passed; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed and fetched 28 market snapshots plus five-year market history; final `npm run build` passed; mock fallback build passed with generated JSON temporarily moved aside and restored; `npm run qa:routes` returned HTTP 200 for `/`, `/markets`, `/assets/SPY`, `/assets/NVDA`, `/assets/BTC-USD`, `/indicators/DGS10`, `/indicators/cpi-yoy`, `/stress`, and `/data-lab`.
- notes/risks: `npm run dev` found an existing Next dev server on port 3000; a second dev start reported the existing server and exited. Route smoke passed against the existing dev server. After clearing the ignored Next dev log and opening `/markets`, `/`, and `/stress` in the browser, no nested `<button>` hydration errors reappeared; only the React DevTools info message was logged.
- next: User visual approval, then merge review when ready.
- commit hash if available: Pending; current commit hash backfill deferred.

## 2026-05-04 18:28 Australia/Melbourne

- task: Polish dashboard IA and local refresh workflow.
- files changed: `app/page.tsx`, `app/stress/page.tsx`, `app/data-lab/page.tsx`, `components/StressRadarClient.tsx`, `scripts/refresh_data.sh`, `package.json`, `package-lock.json`, `README.md`, `docs/current_state.md`, `docs/dev_journal.md`, `docs/roadmap.md`, `docs/architecture.md`.
- what changed: Simplified Dashboard information architecture into a slim hero, pinned indicators, compact market pulse, compact stress radar preview, and one macro snapshot. Removed repeated dashboard detail sections and kept Data Lab-style metadata out of normal pages. Updated Stress radar labels to short axis labels with a legend to avoid Household/Leverage clipping. Added `npm run data:refresh` through `scripts/refresh_data.sh` and documented the local refresh/update workflow in Data Lab and README.
- validation: `npm install` passed with dependencies already up to date; initial `npm run build` caught a Stress radar type issue, then passed after the fix. Full validation passed with `npm run build`, `npm run data:refresh`, final `npm run build`, and `npm run qa:routes`. Route smoke returned HTTP 200 for `/`, `/markets`, `/assets/SPY`, `/assets/NVDA`, `/assets/BTC-USD`, `/indicators/DGS10`, `/indicators/cpi-yoy`, `/stress`, and `/data-lab`.
- notes/risks: Refresh remains local/manual by design; no browser button, backend API, cron, or automatic refresh was added. Stress radar remains context percentile only with partial coverage and no full score. Opened `/`, `/stress`, `/markets`, and `/data-lab` against the running dev server after clearing the ignored Next dev log; no hydration errors appeared, only the React DevTools info message.
- next: User visual review of `/`, `/stress`, `/markets`, and `/data-lab`, then merge review when ready.
- commit hash if available: Pending; current commit hash backfill deferred.

## 2026-05-07 19:45 Australia/Melbourne

- task: Add stress engine foundation docs.
- files changed: `docs/stress_engine_design.md`, `docs/local_research_store.md`, `app/stress/page.tsx`, `docs/current_state.md`, `docs/roadmap.md`, `docs/architecture.md`, `docs/dev_journal.md`.
- what changed: Documented the future transparent stress engine boundary, bucket definitions, directionality and coverage concepts, future `stress_engine.json` output contract, and local research storage evolution. Clarified the current Stress Radar wording as context percentile only, partial coverage, not a full stress score, and future AI/advanced engine work.
- validation: `npm run build` passed and prerendered 62 pages; `npm run qa:routes` passed against the running dev server with HTTP 200 for `/`, `/markets`, `/assets/SPY`, `/assets/NVDA`, `/assets/BTC-USD`, `/indicators/DGS10`, `/indicators/cpi-yoy`, `/stress`, and `/data-lab`.
- notes/risks: This is a docs-first foundation branch. No full scoring model, AI stress analyst, Trader Reader ingestion, SQLite/database implementation, trading signals, or broker integration was added.
- next: Validate build and route smoke, then open Phase 2.3 PR.
- commit hash if available: Pending.

## 2026-05-07 20:18 Australia/Melbourne

- task: Add macro coverage and signal evidence foundation.
- files changed: `config/assets.json`, `config/indicators.json`, `scripts/openbb_pipeline/requirements.txt`, `scripts/openbb_pipeline/catalog_utils.py`, `scripts/openbb_pipeline/fetch_market_snapshot.py`, `scripts/openbb_pipeline/fetch_market_history.py`, `scripts/openbb_pipeline/fetch_macro_indicators.py`, `scripts/openbb_pipeline/run_all.py`, `scripts/openbb_pipeline/build_coverage_summary.py`, `scripts/openbb_pipeline/build_signal_cards.py`, `scripts/openbb_pipeline/build_evidence_cards.py`, `scripts/openbb_pipeline/build_stress_engine.py`, `data/mock/coverage_summary.json`, `data/mock/signal_cards.json`, `data/mock/evidence_cards.json`, `data/mock/stress_engine.json`, `lib/types.ts`, `lib/data.ts`, `components/EvidenceLibraryClient.tsx`, `components/ShellNav.tsx`, `components/LanguageProvider.tsx`, `app/page.tsx`, `app/macro/page.tsx`, `app/stress/page.tsx`, `app/data-lab/page.tsx`, `app/library/page.tsx`, `scripts/qa/route_smoke.mjs`, `README.md`, `docs/current_state.md`, `docs/roadmap.md`, `docs/architecture.md`, `docs/stress_engine_design.md`, `docs/local_research_store.md`, `docs/signal_evidence_design.md`, `docs/dev_journal.md`.
- what changed: Expanded the market and macro catalogs, added coverage summary generation, added mechanical signal cards, deterministic evidence cards, a thin stress engine skeleton, generated/mock readers, a read-only Evidence Library, Data Lab coverage diagnostics, and docs for signal/evidence boundaries.
- validation: `npm install` passed with dependencies already up to date and still reports two moderate npm audit findings; initial `npm run build` passed; `npm run data:refresh` passed and wrote valid local generated coverage, signal, evidence, and stress engine JSON after fixing NaN serialization; final `npm run build` passed; mock fallback build passed with generated JSON temporarily moved aside and restored; `npm run qa:routes` passed with HTTP 200 for `/`, `/markets`, `/assets/SPY`, `/assets/NVDA`, `/assets/BTC-USD`, `/indicators/DGS10`, `/indicators/cpi-yoy`, `/stress`, `/library`, and `/data-lab`.
- notes/risks: This is not AI analysis, Trader Reader ingestion, news scraping, a database, a full stress score, or trading advice. Local generated coverage was 56/56 enabled assets and 34/34 enabled indicators. `USDCNH` remains in the catalog but disabled as an experimental fragile mapping. Pipeline warnings were context-transform warnings rather than failed enabled fetches: pending stress placeholders too short for percentile and no leverage signal coverage.
- next: Run full frontend/pipeline/mock-fallback/route-smoke validation, then open the Phase 2.4/2.5 PR.
- commit hash if available: Pending.
