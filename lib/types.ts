export type SourceName = "generated" | "mock" | "mixed";

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
};

export type MarketSnapshot = {
  source?: string;
  generated_at?: string;
  assets?: Asset[];
  watchlist?: Asset[];
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
  symbols?: { symbol?: string; provider?: string | null; status?: string; real_data?: boolean; error?: string | null }[];
  providers?: { name?: string; status?: string; note?: string }[];
};
