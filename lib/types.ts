export type SourceName = "generated" | "mock" | "mixed";

export type HistoryRow = {
  date?: string;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
};

export type SymbolHistory = {
  symbol?: string;
  proxy?: string;
  name?: string;
  provider?: string | null;
  status?: string;
  real_data?: boolean;
  rows?: HistoryRow[];
};

export type Asset = {
  symbol?: string;
  name?: string;
  proxy?: string;
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
  name?: string;
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
  files?: Record<string, { status?: string; provider?: string | null; real_data?: boolean; warnings?: string[] }>;
  symbols?: { symbol?: string; provider?: string | null; status?: string; real_data?: boolean; history_status?: string; history_rows?: number; error?: string | null }[];
  fred_series?: Record<string, { provider?: string | null; status?: string; real_data?: boolean; latest_date?: string | null }>;
  providers?: { name?: string; status?: string; note?: string }[];
};
