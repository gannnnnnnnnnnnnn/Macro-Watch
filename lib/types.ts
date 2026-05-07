export type SourceName = "generated" | "mock" | "mixed";

export type AssetConfig = {
  symbol: string;
  label?: string;
  name?: string;
  group?: string;
  provider_symbol?: string;
  tradingview_symbol?: string;
  enabled?: boolean;
};

export type IndicatorConfig = {
  id: string;
  series_id?: string;
  label?: string;
  name?: string;
  group?: string;
  unit?: string;
  provider?: string;
  enabled?: boolean;
};

export type PinConfig = {
  type: "asset" | "indicator";
  id: string;
};

export type HistoryRow = {
  date?: string;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
};

export type IndicatorHistoryRow = {
  date?: string;
  value?: number | null;
};

export type SymbolHistory = {
  symbol?: string;
  proxy?: string;
  name?: string;
  group?: string;
  tradingview_symbol?: string;
  provider?: string | null;
  status?: string;
  real_data?: boolean;
  rows?: HistoryRow[];
};

export type IndicatorHistoryItem = {
  id?: string;
  series_id?: string;
  label?: string;
  name?: string;
  group?: string;
  unit?: string;
  provider?: string | null;
  status?: string;
  real_data?: boolean;
  rows?: IndicatorHistoryRow[];
};

export type Asset = {
  symbol?: string;
  label?: string;
  name?: string;
  group?: string;
  proxy?: string;
  tradingview_symbol?: string;
  value?: number | string | null;
  unit?: string;
  change?: number | null;
  status?: string;
  provider?: string | null;
  real_data?: boolean;
  latest_date?: string;
  previous_close?: number | null;
};

export type Indicator = {
  id?: string;
  series_id?: string;
  name?: string;
  label?: string;
  value?: number | string | null;
  unit?: string;
  status?: string;
  note?: string;
  bucket?: string;
  latest_date?: string | null;
  provider?: string | null;
  real_data?: boolean;
  previous_value?: number | string | null;
  delta?: number | null;
  delta_label?: string | null;
  one_year_delta?: number | null;
  one_year_delta_label?: string | null;
  href?: string;
};

export type ResolvedResearchItem = {
  id: string;
  type: "asset" | "indicator";
  label: string;
  value: number | string | null;
  unit?: string;
  provider?: string | null;
  latest_date?: string | null;
  status?: string;
  real_data?: boolean;
  delta_label?: string | null;
  one_year_delta_label?: string | null;
  note?: string;
  href: string;
};

export type MarketSnapshot = {
  source?: string;
  generated_at?: string;
  assets?: Asset[];
  watchlist?: Asset[];
};

export type MarketHistory = {
  source?: string;
  generated_at?: string;
  provider?: string | null;
  status?: string;
  real_data?: boolean;
  warnings?: string[];
  symbols?: Record<string, SymbolHistory>;
};

export type IndicatorHistory = {
  source?: string;
  generated_at?: string;
  provider?: string | null;
  status?: string;
  real_data?: boolean;
  warnings?: string[];
  indicators?: Record<string, IndicatorHistoryItem>;
};

export type MacroIndicators = {
  source?: string;
  generated_at?: string;
  groups?: Record<string, Indicator[]>;
};

export type StressIndicators = {
  source?: string;
  generated_at?: string;
  buckets?: Record<string, Indicator[]>;
};

export type PipelineStatus = {
  source?: string;
  generated_at?: string;
  status?: string;
  warnings?: string[];
  files?: Record<string, { status?: string; provider?: string | null; real_data?: boolean; warnings?: string[]; series?: Record<string, unknown> }>;
  symbols?: { symbol?: string; provider?: string | null; status?: string; real_data?: boolean; history_status?: string; history_rows?: number; error?: string | null }[];
  fred_series?: Record<string, { provider?: string | null; status?: string; real_data?: boolean; latest_date?: string | null }>;
  config?: { assets_total?: number; assets_enabled?: number; assets_disabled?: number; indicators_enabled?: number; derived_indicators_enabled?: number };
  providers?: { name?: string; status?: string; note?: string }[];
};
