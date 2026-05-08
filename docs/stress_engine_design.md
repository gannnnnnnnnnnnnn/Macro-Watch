# Stress Engine Design

## Purpose

The current Stress Radar is a context percentile view only. It is not a full stress score, not trading advice, and not a complete macro regime model. Coverage is partial, and some directionality is provisional until the project has enough wired indicators and review time to make the model auditable.

The future stress engine should be transparent, auditable, and separate from AI. AI may later explain a generated stress engine output, but it must not invent scores, fill missing buckets, or hide the method behind prose.

## Current Rules

- Stress context must come from local generated or mock JSON.
- Missing indicators stay pending or unavailable.
- Composite stress should not exist until bucket coverage is sufficient.
- Directionality must be explicit per indicator or bucket.
- Any score-like field must be reproducible from the stored data and method.

## Buckets

### Volatility

- intended meaning: Market-implied volatility and volatility shock context.
- currently wired indicators: VIX from the market snapshot/history when available.
- missing candidate indicators: VVIX, MOVE, realized volatility, SKEW, volatility term structure.
- directionality notes: Higher VIX usually means tighter risk conditions, but percentile context should avoid calling it good or bad.
- possible transforms: historical percentile, z-score, rolling change, trend acceleration, confirmation count.
- coverage/confidence concept: Low until multiple volatility measures are wired.

### Credit

- intended meaning: Corporate funding stress and spread compensation.
- currently wired indicators: High yield OAS, Baa spread versus 10Y.
- missing candidate indicators: BBB OAS, investment-grade OAS, leveraged loan spreads, default expectations.
- directionality notes: Higher spreads usually mean tighter credit conditions.
- possible transforms: historical percentile, z-score, rolling change, trend acceleration, confirmation count.
- coverage/confidence concept: Medium once HY and IG/Baa coverage are both present and updating.

### Liquidity

- intended meaning: System liquidity, reserves, central-bank balance sheet, and collateral/cash pressure.
- currently wired indicators: Fed total assets, overnight reverse repos.
- missing candidate indicators: bank reserves, Treasury General Account, SOFR stress, repo fails, money-market fund assets.
- directionality notes: Direction can be context-dependent; shrinking liquidity can tighten conditions, while falling RRP can also release cash into other channels.
- possible transforms: historical percentile, z-score, rolling change, trend acceleration, confirmation count.
- coverage/confidence concept: Low until directionality is reviewed indicator by indicator.

### Treasury

- intended meaning: Rates, curve shape, and Treasury-market context.
- currently wired indicators: 10Y Treasury yield, 2Y Treasury yield, 10Y-2Y spread, 10Y-3M spread when available.
- missing candidate indicators: 30Y yield, term premium, auction tails, bid-to-cover, Treasury volatility, MOVE.
- directionality notes: Curve inversion, rapid yield moves, and liquidity stress can mean different things; transforms must remain descriptive.
- possible transforms: historical percentile, z-score, rolling change, trend acceleration, confirmation count.
- coverage/confidence concept: Medium for basic curve context, low for Treasury-market functioning.

### Banking

- intended meaning: Bank equity, funding, and balance-sheet stress.
- currently wired indicators: None as a completed bucket.
- missing candidate indicators: KRE, XLF, bank credit, deposits, commercial bank assets/liabilities, discount window borrowing, BTFP-like facilities when relevant.
- directionality notes: Lower bank equity proxies may indicate stress, while facility usage direction depends on the facility.
- possible transforms: historical percentile, z-score, rolling change, trend acceleration, confirmation count.
- coverage/confidence concept: Pending until bank-specific indicators are wired.

### Household

- intended meaning: Household credit, employment, consumer pressure, and balance-sheet stress.
- currently wired indicators: None as a completed bucket.
- missing candidate indicators: unemployment, initial claims, delinquency rates, consumer credit, credit-card rates, real income, mortgage rates.
- directionality notes: Higher unemployment/claims/delinquencies usually indicate more stress; income and employment require inverse direction handling.
- possible transforms: historical percentile, z-score, rolling change, trend acceleration, confirmation count.
- coverage/confidence concept: Pending until labor and household credit indicators are grouped intentionally.

### Leverage

- intended meaning: Market leverage, funding leverage, and forced-deleveraging context.
- currently wired indicators: None as a completed bucket.
- missing candidate indicators: margin debt, dealer positioning proxies, hedge fund leverage proxies, financial conditions leverage components.
- directionality notes: High leverage is not automatically stress, but rising leverage can increase fragility when confirmed by volatility or credit stress.
- possible transforms: historical percentile, z-score, rolling change, trend acceleration, confirmation count.
- coverage/confidence concept: Pending until reliable no-key or local data sources are identified.

## Future Output Contract

Generated file:

`data/generated/stress_engine.json`

Suggested shape:

```json
{
  "version": "stress-engine-v1",
  "generated_at": "...",
  "method": "transparent_context_model",
  "buckets": [
    {
      "id": "credit",
      "label": "Credit",
      "context_percentile": 0,
      "coverage": 0,
      "wired_coverage": 0,
      "candidate_coverage": 0,
      "coverage_note": "wired_coverage uses currently wired signal cards; candidate_coverage also includes missing candidate indicators.",
      "confidence": "low|medium|high",
      "directionality": "higher_is_tighter",
      "indicators": [],
      "warnings": []
    }
  ],
  "composite": {
    "available": false,
    "reason": "Composite not enabled until bucket coverage is sufficient."
  }
}
```

## Composite Policy

The Phase 2.5 file is a skeleton that groups signal cards into stress buckets. Composite stress should remain unavailable until bucket coverage is broad enough, directionality has been reviewed, and missing-data behavior is visible in the output. A future composite should be optional, explainable, and easy to audit from the JSON.

AI can later summarize or explain `stress_engine.json`. AI should not calculate hidden scores, infer missing indicators, or turn partial context into trading advice.
