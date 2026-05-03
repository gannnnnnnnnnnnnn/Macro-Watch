# Current State

## Current phase

Initial local Macro-Watch v0 scaffold.

## Current runnable path

Next.js frontend reads `data/generated/*.json` first, then falls back to `data/mock/*.json`. Python OpenBB pipeline writes `data/generated/*.json`.

## Current stack

Next.js, TypeScript, Tailwind CSS, local JSON files, Python pipeline with optional OpenBB.

## Current data contract

Frontend consumes `market_snapshot.json`, `macro_indicators.json`, `stress_indicators.json`, and optional `pipeline_status.json`. Each file should include a `source` or status metadata, timestamps when available, and arrays of indicators that tolerate missing fields.

## Next step

Replace fallback pipeline values with real OpenBB-backed fetches where no paid API keys are required.
