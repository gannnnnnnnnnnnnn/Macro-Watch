# Dev Journal

Append-only lightweight project journal.

## 2026-05-03 13:04 Australia/Melbourne

- task: Create initial local Macro-Watch v0 scaffold.
- files changed: `AGENTS.md`, `README.md`, `.gitignore`, `.agents/skills/update-dev-docs/SKILL.md`, `.agents/skills/publish-review-checkpoint/SKILL.md`, `docs/current_state.md`, `docs/dev_journal.md`, `docs/roadmap.md`, `docs/architecture.md`, `package.json`, `package-lock.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `next-env.d.ts`, `app/**`, `components/**`, `lib/**`, `data/mock/**`, `data/generated/.gitkeep`, `scripts/openbb_pipeline/**`.
- what changed: Added workflow docs, local Next.js/TypeScript/Tailwind cockpit pages, file-based generated-first/mock-fallback data loading, mock market/macro/stress data, and an OpenBB-aware pipeline skeleton that writes generated fallback data with warnings.
- validation: `npm install` passed; `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`; `python3 -m venv .venv` passed; `pip install -r requirements.txt` passed; `python run_all.py` passed and wrote generated JSON plus `pipeline_status.json`.
- notes/risks: `npm install` reported two moderate audit findings. OpenBB installed locally, but v0 live fetches are intentionally conservative and currently write generated fallback records with warning status.
- next: Replace fallback pipeline records with real no-paid-key OpenBB fetches and add chart rendering once the data contract settles.
- commit hash if available: Pending.

## 2026-05-03 13:36 Australia/Melbourne

- task: Wire first OpenBB real data pipeline.
- files changed: `scripts/openbb_pipeline/fetch_market_snapshot.py`, `scripts/openbb_pipeline/fetch_macro_indicators.py`, `scripts/openbb_pipeline/fetch_stress_indicators.py`, `scripts/openbb_pipeline/run_all.py`, `app/data-lab/page.tsx`, `components/Cockpit.tsx`, `lib/types.ts`, `docs/current_state.md`, `docs/dev_journal.md`.
- what changed: Replaced market fallback-only behavior with real OpenBB historical fetches using yfinance for SPY, QQQ, VIX via `^VIX`, UUP, TLT, GLD, USO, and BTC-USD; added per-symbol status/error handling; expanded `pipeline_status.json` with per-file and per-symbol status; kept macro and stress as clearly labeled placeholders; surfaced provider, file, and symbol status in Data Lab.
- validation: `npm run build` initially failed on a Data Lab TypeScript fallback tuple inference issue, then passed after the type fix; `python3 -m venv .venv` was not needed because `.venv` already existed; `pip install -r requirements.txt` passed with requirements already satisfied; `python run_all.py` passed and fetched real yfinance data through OpenBB for all market symbols; final `npm run build` passed and prerendered `/`, `/markets`, `/macro`, `/stress`, and `/data-lab`.
- notes/risks: OpenBB real market fetch worked locally for all requested market proxies. No unavailable market symbols in local validation. Overall pipeline status is `warning` because macro and stress files are still placeholder/unavailable by design.
- next: Add the first real no-key macro or stress indicator source, then consider simple market history charts.
- commit hash if available: Pending.
