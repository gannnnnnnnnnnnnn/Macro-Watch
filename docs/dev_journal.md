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
