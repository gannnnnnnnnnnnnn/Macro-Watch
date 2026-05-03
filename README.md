# Macro-Watch

Macro-Watch is a fast local-first macro research cockpit. The v0.1 base is an OpenStock-inspired market UI backed by generated JSON from an OpenBB-powered Python pipeline, with mock JSON fallback when generated data is missing or incomplete. Phase 2 adds an interactive research workbench with config-driven assets, indicators, pins, detail pages, local Lightweight Charts, chart ranges, lightweight overlays, and a cleaner product UI.

Trader Reader comes later. AI features come later. Broker integration is out of scope.

## Local Frontend

```bash
npm install
npm run dev
npm run build
```

The app runs with Next.js, TypeScript, and Tailwind. It renders:

- `/`
- `/markets`
- `/macro`
- `/stress`
- `/data-lab`
- `/assets/[symbol]`
- `/indicators/[id]`

## Local Data Pipeline

```bash
cd scripts/openbb_pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run_all.py
```

The frontend prefers `data/generated/*.json`. If generated files are missing, invalid, or incomplete, it falls back to `data/mock/*.json` and labels unavailable fields clearly.

Generated JSON files are ignored by git except for `data/generated/.gitkeep`. Run the pipeline locally when you want real market, macro, stress, and chart history data; otherwise the frontend uses the committed mock fallback data.

The pipeline tries to use OpenBB when available. If OpenBB is missing or a fetch fails, it writes fallback generated JSON with warning status instead of failing silently.

## Catalogs

- `config/assets.json` defines tracked market assets.
- `config/indicators.json` defines FRED and derived macro indicators.
- `config/pins.json` defines static dashboard pins.

Charts use local generated/mock JSON through TradingView Lightweight Charts. The public TradingView widget is kept only as a lower-priority external reference on asset detail pages.

Pins and the EN / 中文 language toggle are stored in browser `localStorage`; config files remain the default source and are not mutated from the UI.

## QA

When the dev server is running, key local routes can be smoke-tested with:

```bash
npm run qa:routes
```

This does not replace visual review. Before merge, visually review Dashboard, Markets, asset detail pages, indicator detail pages, Stress, and Data Lab.

## Current Shape

- UI: dark-mode-first market cockpit plus interactive research workbench
- Data contract: JSON files under `data/generated` or `data/mock`
- Pipeline: local Python scripts under `scripts/openbb_pipeline`
- No database, backend service, auth, deployment setup, Trader Reader, AI chat, thesis validation, fake scoring, or broker integration
