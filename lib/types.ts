export type SourceName = "generated" | "mock" | "mixed";

export type Asset = {
  symbol?: string;
  name?: string;
  proxy?: string;
  value?: number | string | null;
  unit?: string;
  change?: number | null;
  status?: string;
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
  providers?: { name?: string; status?: string; note?: string }[];
};
