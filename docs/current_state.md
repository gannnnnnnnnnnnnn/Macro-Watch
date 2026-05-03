# Current State

## Current phase

First-pass real market data pipeline.

## Current runnable path

Next.js frontend reads `data/generated/*.json` first, then falls back to `data/mock/*.json`. Python OpenBB pipeline writes `data/generated/*.json`.

## Current stack

Next.js, TypeScript, Tailwind CSS, local JSON files, Python pipeline with OpenBB/yfinance market fetches and placeholder macro/stress outputs.

## Current data contract

Frontend consumes `market_snapshot.json`, `macro_indicators.json`, `stress_indicators.json`, and optional `pipeline_status.json`. Market assets include latest close, previous close, percentage change, provider, per-symbol status, and `real_data`; macro and stress indicators remain placeholder/unavailable when direct free data is not wired.

## Next step

Wire the next no-key macro or stress source, then add simple chart rendering for market history.
