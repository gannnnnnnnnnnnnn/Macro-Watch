# Product Vision

## One-line Product

Macro-Watch is a local-first macro research terminal that connects market data, macro indicators, stress diagnostics, evidence cards, and future AI-assisted thesis validation.

## Product Thesis

The product is not a trading bot and not a broker terminal. It is a research workbench for observing macro state, transition signals, financial stress, and evidence trails. The goal is to help the user find, compare, and validate macro views with structured evidence.

The Evidence Library is the audit layer between raw signals and future AI analysis.

Research Workspace is the bridge between evidence cards and future AI-assisted thesis validation.

## Core Principles

- Local first.
- Evidence first.
- No fake scores.
- AI explains evidence later; it should not invent hidden scores.
- Generated/mock fallback keeps the app runnable.
- Small PRs, clear milestones, reversible architecture.
- Research pages should be useful before AI is added.

## Final Architecture

```text
Macro-Watch Terminal
├─ Terminal Shell
│  ├─ Module registry
│  ├─ Terminal navigation
│  ├─ Data Source Center
│  ├─ Workspace layout later
│  └─ Future module gates
│
├─ DataHub-lite / Data Pipeline
│  ├─ Market data
│  ├─ Macro data
│  ├─ Stress data
│  ├─ Event calendar later
│  ├─ News/Event summaries later
│  ├─ Trader articles later
│  └─ Topic contracts
│
├─ Signal + Evidence Layer
│  ├─ Signal cards
│  ├─ Indicator evidence cards
│  ├─ Event evidence cards later
│  ├─ News evidence cards later
│  ├─ Cycle evidence cards later
│  └─ User notes later
│
├─ Engines
│  ├─ Signal Engine
│  ├─ Stress Engine
│  ├─ Cycle Atlas later
│  ├─ Trader Claim Engine later
│  └─ AI Analyst later
│
└─ UI Modules
   ├─ Dashboard
   ├─ Markets
   ├─ Macro
   ├─ Stress
   ├─ Stress bucket detail pages
   ├─ Assets
   ├─ Indicators
   ├─ Evidence Library
   ├─ Research Workspace
   ├─ Data Source Center
   ├─ Cycle Atlas later
   ├─ Trader Reader later
   └─ AI Research later
```

## Near-term Roadmap

- v0.8 Stress Bucket Detail Pages
- v0.9 Evidence-first Analytics Upgrade
- v1.0 Research Workspace MVP
- v1.1 AI Mode Selector
- v1.2 Trader Reader MVP
- v1.3 Research Flow Builder

## Boundaries

Do not add broker execution, trading signals, hidden stress scoring, opaque AI conclusions, or database complexity until there is a clear reason.
