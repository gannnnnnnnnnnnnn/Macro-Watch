# Signal and Evidence Design

## Purpose

Phase 2.5 adds a lightweight structured layer between raw data and future research modules.

Signal cards are transformed observations. Evidence cards are auditable references. Neither one is a trading signal, AI analysis, regime call, or buy/sell recommendation.

## Signal Cards

Generated file:

`data/generated/signal_cards.json`

Signal cards convert local market, macro, and stress context into deterministic observations:

- latest value
- provider/status
- history length
- 5Y percentile when enough history exists
- 5Y z-score when enough history exists
- rolling changes
- trend, acceleration label, and optional numeric acceleration value
- confidence and coverage note

The transforms are intentionally simple and auditable. Missing data stays unavailable, and short history leaves transforms null with warnings.

Rolling changes use approximate calendar windows rather than row counts:

- `rolling_change_1m`: latest value minus the latest observation at or before 30 days prior.
- `rolling_change_3m`: latest value minus the latest observation at or before 90 days prior.
- `rolling_change_1y`: latest value minus the latest observation at or before 365 days prior.

`acceleration` is a label: `positive`, `negative`, `flat`, or `unknown`. `acceleration_value` stores the simple numeric difference between the 1M and 3M rolling changes when available.

## Evidence Cards

Generated file:

`data/generated/evidence_cards.json`

Evidence cards reference signal cards and source pages. They are mechanical summaries such as:

- Latest value available with 5Y context.
- History too short for percentile.
- Signal unavailable; pipeline warning present.

Evidence cards are not AI prose, notes, news summaries, or article ingestion.

## Stress Engine Relationship

The stress engine consumes signal cards, not vibes. The Phase 2.5 `stress_engine.json` file is a skeleton that groups relevant signal cards by bucket and keeps composite stress disabled.

AI can later read signal, evidence, and stress outputs, but it should cite evidence and should not invent scores, missing data, or certainty.

## Future Modules

- Stress Engine can use signal cards for transparent bucket context.
- Cycle Atlas can later use signal/evidence history to compare macro phases.
- Trader Reader can later create article/claim evidence cards, but ingestion is not implemented now.
- AI Analyst can later summarize evidence cards with citations, but should not create hidden calculations.

## Boundaries

- No buy/sell signals.
- No macro regime calls.
- No composite stress score until coverage and directionality are reviewed.
- No news scraping, PDF ingestion, or manual evidence editing in this phase.
