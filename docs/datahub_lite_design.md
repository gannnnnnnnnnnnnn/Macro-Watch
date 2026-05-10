# DataHub-lite Design

Macro-Watch currently uses local JSON as the source of truth. Future modules need a stable topic/data contract so Dashboard, Markets, Macro, Stress, Evidence Library, Trader Reader, AI Research, and Cycle Atlas can consume the same data without each module inventing its own shape.

## Current Source of Truth

The current app reads `data/generated/*.json` first and falls back to `data/mock/*.json` when generated files are missing or incomplete. v0.7 keeps that contract. It does not add live pub/sub, a database, connector editing, or a backend service.

## Topic Examples

```text
asset:snapshot:SPY
asset:history:SPY:5y:1d
macro:fred:DGS10
macro:derived:10y-2y-spread
stress:bucket:credit
stress:confirmation:credit_vs_volatility
evidence:card:<id>
signal:card:<id>
reader:article:<id>
reader:claim:<id>
cycle:segment:<id>
ai:analysis:<id>
```

## Future Flow

```text
provider/config
→ pipeline fetch
→ normalized local dataset
→ signal cards
→ evidence cards
→ stress/cycle/trader modules
→ UI and AI context packs
```

## Contract Direction

- Provider fetchers should normalize into local datasets before UI modules consume them.
- Signal and evidence cards should remain auditable and reusable across modules.
- Stress, cycle, trader, and AI modules should read stable topics instead of scraping page-specific structures.
- Missing or partial data should produce explicit unavailable/warning states.

## v0.7 Boundary

DataHub-lite is a design contract for future modules. v0.7 does not implement a real event bus, live subscriptions, SQLite, or a database-backed data layer. Generated/mock JSON remains the current source of truth.

Growth does not become a Stress bucket yet. A future Macro/Stress bridge may add virtual confirmation such as `Household vs Growth` using growth signal cards.
