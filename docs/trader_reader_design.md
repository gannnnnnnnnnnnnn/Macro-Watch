# Trader Reader Future Design Note

Trader Reader is not implemented in Phase 2.2. This note records a future claim schema so later ingestion work can stay structured and testable.

## Future Claim Schema

Each extracted claim should be able to capture:

- `article_title`: source article title.
- `publish_date`: original publish date.
- `source_file_or_link`: local file path or URL.
- `instrument`: SPX, SPY, QQQ, VIX, BTC, or another referenced market.
- `forecast_direction`: up, down, range, volatile, unclear.
- `target_level`: explicit target such as an SPX level.
- `invalidation_level`: price, indicator, or event that invalidates the claim.
- `time_window`: dates or horizon mentioned by the author.
- `indicators_cited`: VIX, NYMO, RSI, moving averages, spreads, breadth, macro series, or other referenced inputs.
- `reasoning_tags`: sentiment, wave count, divergence, liquidity, macro trigger, geopolitical trigger, positioning, breadth.
- `path_or_scenario_label`: base case, alternate path, bullish path, bearish path, squeeze path.
- `follow_up_outcome`: later result or review status.
- `notes`: concise context that does not rewrite the article.

## Boundaries

Future Trader Reader work should extract structured claims and keep them auditable. It should not create opaque buy/sell advice, broker actions, or AI-generated thesis validation without a separate product decision.
