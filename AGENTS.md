# Macro-Watch Agent Notes

Macro-Watch is a local-first macro research cockpit.

Current priority is an OpenStock-inspired UI plus an OpenBB data pipeline.

This is not an auto-trading system, broker integration, production platform, multi-agent orchestration project, or thesis validation system yet.

Work on feature branches. Make the smallest useful change that can run locally.

Do not silently replace the frontend stack, data pipeline, or generated data contract in one pass.

Do not build Trader Reader or AI features until the market cockpit and data path are stable.

The intended current runnable path is:

1. Next.js frontend reads `data/generated/*.json` first, then falls back to `data/mock/*.json`.
2. Python OpenBB pipeline writes `data/generated/*.json`.

Avoid ORM, database, auth, backend service, deployment setup, and unnecessary abstractions.

UI must not crash when fields are missing.
