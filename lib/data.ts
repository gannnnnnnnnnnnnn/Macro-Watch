import fs from "fs";
import path from "path";
import assetsConfig from "@/config/assets.json";
import indicatorsConfig from "@/config/indicators.json";
import pinsConfig from "@/config/pins.json";
import { assetHref, indicatorHref } from "./routes";
import { formatPercent } from "./format";
import type {
  Asset,
  AssetConfig,
  CoverageSummary,
  EvidenceCards,
  Indicator,
  IndicatorConfig,
  IndicatorHistory,
  MarketHistory,
  MarketSnapshot,
  PinConfig,
  PipelineStatus,
  ResolvedResearchItem,
  SignalCards,
  SourceName,
  StressEngine,
  StressEngineBucket,
  StressIndicators,
  MacroIndicators,
} from "./types";

const root = process.cwd();

function readJson<T>(folder: "generated" | "mock", file: string): T | null {
  try {
    const fullPath = path.join(root, "data", folder, file);
    if (!fs.existsSync(fullPath)) return null;
    const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8")) as T;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function hasArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function hasGroups(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && Object.values(value).some(hasArray));
}

function choose<T>(file: string, complete: (value: T) => boolean): { data: T; source: SourceName } {
  const generated = readJson<T>("generated", file);
  if (generated && complete(generated)) return { data: generated, source: "generated" };
  const mock = readJson<T>("mock", file);
  if (mock) return { data: mock, source: "mock" };
  return { data: {} as T, source: "mock" };
}

function enrichMarketSnapshot(snapshot: MarketSnapshot): MarketSnapshot {
  const catalog = getAssetCatalog();
  const enrich = (asset: Asset): Asset => {
    const config = catalog.find((item) => item.symbol === asset.symbol);
    return config
      ? {
          label: config.label,
          name: config.name,
          group: config.group,
          proxy: config.provider_symbol,
          tradingview_symbol: config.tradingview_symbol,
          priority: config.priority,
          tags: config.tags,
          ...asset,
        }
      : asset;
  };
  return {
    ...snapshot,
    assets: snapshot.assets?.map(enrich),
    watchlist: snapshot.watchlist?.map(enrich),
  };
}

export function getAssetCatalog(): AssetConfig[] {
  return (assetsConfig.assets ?? []) as AssetConfig[];
}

export function getEnabledAssetCatalog(): AssetConfig[] {
  return getAssetCatalog().filter((asset) => asset.enabled);
}

export function getIndicatorCatalog(): IndicatorConfig[] {
  return ([...(indicatorsConfig.indicators ?? []), ...(indicatorsConfig.derived ?? [])]) as IndicatorConfig[];
}

export function getEnabledIndicatorCatalog(): IndicatorConfig[] {
  return getIndicatorCatalog().filter((indicator) => indicator.enabled);
}

export function getPinCatalog(): PinConfig[] {
  return (pinsConfig.pins ?? []) as PinConfig[];
}

export function getCockpitData() {
  const market = choose<MarketSnapshot>("market_snapshot.json", (d) => hasArray(d.assets));
  const marketHistory = choose<MarketHistory>("market_history.json", (d) => Boolean(d.symbols && Object.values(d.symbols).some((item) => hasArray(item.rows))));
  const indicatorHistory = choose<IndicatorHistory>("indicator_history.json", (d) => Boolean(d.indicators && Object.values(d.indicators).some((item) => hasArray(item.rows))));
  const macro = choose<MacroIndicators>("macro_indicators.json", (d) => hasGroups(d.groups));
  const stress = choose<StressIndicators>("stress_indicators.json", (d) => hasGroups(d.buckets));
  const coverage = choose<CoverageSummary>("coverage_summary.json", (d) => Boolean(d.assets || d.indicators));
  const signalCards = choose<SignalCards>("signal_cards.json", (d) => hasArray(d.cards));
  const evidenceCards = choose<EvidenceCards>("evidence_cards.json", (d) => hasArray(d.cards));
  const stressEngine = choose<StressEngine>("stress_engine.json", (d) => hasArray(d.buckets));
  const pipelineStatus = readJson<PipelineStatus>("generated", "pipeline_status.json") ?? {
    source: "mock",
    status: "No generated pipeline status found",
    warnings: ["Run the local pipeline to create generated data."],
    providers: [],
  };
  const sources = [market.source, marketHistory.source, indicatorHistory.source, macro.source, stress.source, coverage.source, signalCards.source, evidenceCards.source, stressEngine.source];
  const source: SourceName = sources.every((s) => s === "generated")
    ? "generated"
    : sources.every((s) => s === "mock")
      ? "mock"
      : "mixed";

  return {
    market: enrichMarketSnapshot(market.data),
    marketHistory: marketHistory.data,
    indicatorHistory: indicatorHistory.data,
    macro: macro.data,
    stress: stress.data,
    coverage: coverage.data,
    signalCards: signalCards.data,
    evidenceCards: evidenceCards.data,
    stressEngine: stressEngine.data,
    pipelineStatus,
    source,
  };
}

export function allIndicators(macro: MacroIndicators, stress: StressIndicators): Indicator[] {
  const macroItems = Object.values(macro.groups ?? {}).flat();
  const stressItems = Object.values(stress.buckets ?? {}).flat();
  const byKey = new Map<string, Indicator>();
  for (const item of [...macroItems, ...stressItems]) {
    const id = item.id ?? item.series_id ?? item.name;
    if (id && !byKey.has(id)) byKey.set(id, { ...item, href: indicatorHref(id) });
  }
  return [...byKey.values()];
}

export function withIndicatorHrefs(items: Indicator[] | undefined): Indicator[] | undefined {
  return items?.map((item) => {
    const id = item.id ?? item.series_id ?? item.name;
    return id ? { ...item, href: indicatorHref(id) } : item;
  });
}

export function resolveAsset(symbol: string, market?: MarketSnapshot): Asset {
  const config = getAssetCatalog().find((asset) => asset.symbol.toLowerCase() === symbol.toLowerCase());
  const asset = market?.assets?.find((item) => item.symbol?.toLowerCase() === symbol.toLowerCase());
  return {
    symbol: config?.symbol ?? asset?.symbol ?? symbol,
    label: config?.label ?? asset?.label ?? symbol,
    name: asset?.name ?? config?.name ?? "Unavailable",
    group: asset?.group ?? config?.group,
    proxy: asset?.proxy ?? config?.provider_symbol,
    tradingview_symbol: asset?.tradingview_symbol ?? config?.tradingview_symbol,
    value: asset?.value ?? null,
    unit: asset?.unit ?? "",
    change: asset?.change ?? null,
    status: asset?.status ?? "unavailable",
    provider: asset?.provider ?? null,
    real_data: Boolean(asset?.real_data),
    latest_date: asset?.latest_date,
    previous_close: asset?.previous_close ?? null,
  };
}

export function resolveIndicator(idOrName: string, macro?: MacroIndicators, stress?: StressIndicators): Indicator {
  const normalized = decodeURIComponent(idOrName).toLowerCase();
  const config = getIndicatorCatalog().find((item) => item.id.toLowerCase() === normalized || item.series_id?.toLowerCase() === normalized || item.label?.toLowerCase() === normalized);
  const item = allIndicators(macro ?? {}, stress ?? {}).find((indicator) => {
    return [indicator.id, indicator.series_id, indicator.name, indicator.label].some((value) => value?.toLowerCase() === normalized);
  });
  const id = config?.id ?? item?.id ?? item?.series_id ?? idOrName;
  return {
    id,
    series_id: item?.series_id ?? config?.series_id,
    name: item?.name ?? config?.label ?? config?.name ?? idOrName,
    label: item?.label ?? item?.name ?? config?.label ?? config?.name ?? idOrName,
    value: item?.value ?? null,
    unit: item?.unit ?? config?.unit ?? "",
    status: item?.status ?? "unavailable",
    note: item?.note ?? "Run the local pipeline for generated indicator data.",
    latest_date: item?.latest_date ?? null,
    provider: item?.provider ?? config?.provider ?? null,
    real_data: Boolean(item?.real_data),
    previous_value: item?.previous_value ?? null,
    delta: item?.delta ?? null,
    delta_label: item?.delta_label ?? "Last obs unavailable",
    one_year_delta: item?.one_year_delta ?? null,
    one_year_delta_label: item?.one_year_delta_label ?? "1Y unavailable",
    href: indicatorHref(id),
  };
}

export function marketHistoryFor(symbol: string, history?: MarketHistory) {
  return history?.symbols?.[symbol]?.rows ?? [];
}

export function indicatorHistoryFor(id: string, history?: IndicatorHistory) {
  return history?.indicators?.[id]?.rows ?? [];
}

export function getCoverageSummary() {
  return choose<CoverageSummary>("coverage_summary.json", (d) => Boolean(d.assets || d.indicators)).data;
}

export function getSignalCards() {
  return choose<SignalCards>("signal_cards.json", (d) => hasArray(d.cards)).data;
}

export function getEvidenceCards() {
  return choose<EvidenceCards>("evidence_cards.json", (d) => hasArray(d.cards)).data;
}

export function getStressEngine() {
  return choose<StressEngine>("stress_engine.json", (d) => hasArray(d.buckets)).data;
}

export function stressBucketById(id: string, engine = getStressEngine()): StressEngineBucket | undefined {
  const normalized = id.toLowerCase();
  return engine.buckets?.find((bucket) => bucket.id?.toLowerCase() === normalized || bucket.label?.toLowerCase() === normalized);
}

export function stressDriversForBucket(id: string, engine = getStressEngine()) {
  return stressBucketById(id, engine)?.drivers ?? [];
}

export function stressEvidenceForBucket(id: string, engine = getStressEngine()) {
  const bucket = stressBucketById(id, engine);
  return {
    drivers: bucket?.drivers ?? [],
    counterEvidence: bucket?.counter_evidence ?? [],
    watchItems: bucket?.watch_items ?? [],
  };
}

export function signalCardsForBucket(bucket: string) {
  return (getSignalCards().cards ?? []).filter((card) => card.bucket === bucket);
}

export function evidenceCardsForSource(sourceId: string) {
  return (getEvidenceCards().cards ?? []).filter((card) => card.source_ids?.includes(sourceId));
}

export function evidenceCardsForModule(module: string) {
  return (getEvidenceCards().cards ?? []).filter((card) => card.module === module);
}

export function resolvePinnedItems(): ResolvedResearchItem[] {
  const { market, macro, stress } = getCockpitData();
  return getPinCatalog().map((pin) => {
    if (pin.type === "asset") {
      const asset = resolveAsset(pin.id, market);
      return {
        id: asset.symbol ?? pin.id,
        type: "asset",
        label: asset.label ?? asset.symbol ?? pin.id,
        value: asset.value ?? null,
        unit: asset.unit,
        provider: asset.provider,
        latest_date: asset.latest_date,
        status: asset.status,
        real_data: asset.real_data,
        delta_label: typeof asset.change === "number" ? formatPercent(asset.change) : "Last obs unavailable",
        note: "Market watch item; context only, not scored.",
        href: assetHref(asset.symbol ?? pin.id),
      };
    }
    const indicator = resolveIndicator(pin.id, macro, stress);
    return {
      id: indicator.id ?? pin.id,
      type: "indicator",
      label: indicator.label ?? indicator.name ?? pin.id,
      value: indicator.value ?? null,
      unit: indicator.unit,
      provider: indicator.provider,
      latest_date: indicator.latest_date,
      status: indicator.status,
      real_data: indicator.real_data,
      delta_label: indicator.delta_label,
      one_year_delta_label: indicator.one_year_delta_label,
      note: indicator.note ?? "Indicator watch item; context only, not scored.",
      href: indicator.href ?? indicatorHref(pin.id),
    };
  });
}

export function resolveAllResearchItems(): ResolvedResearchItem[] {
  const { market, macro, stress } = getCockpitData();
  const assets = getEnabledAssetCatalog().map((config) => {
    const asset = resolveAsset(config.symbol, market);
    return {
      id: asset.symbol ?? config.symbol,
      type: "asset" as const,
      label: asset.label ?? asset.symbol ?? config.symbol,
      value: asset.value ?? null,
      unit: asset.unit,
      provider: asset.provider,
      latest_date: asset.latest_date,
      status: asset.status,
      real_data: asset.real_data,
      delta_label: typeof asset.change === "number" ? formatPercent(asset.change) : "Last obs unavailable",
      note: "Market watch item; context only, not scored.",
      href: assetHref(asset.symbol ?? config.symbol),
    };
  });
  const indicators = getEnabledIndicatorCatalog().map((config) => {
    const indicator = resolveIndicator(config.id, macro, stress);
    return {
      id: indicator.id ?? config.id,
      type: "indicator" as const,
      label: indicator.label ?? indicator.name ?? config.label ?? config.id,
      value: indicator.value ?? null,
      unit: indicator.unit,
      provider: indicator.provider,
      latest_date: indicator.latest_date,
      status: indicator.status,
      real_data: indicator.real_data,
      delta_label: indicator.delta_label,
      one_year_delta_label: indicator.one_year_delta_label,
      note: indicator.note ?? "Indicator watch item; context only, not scored.",
      href: indicator.href ?? indicatorHref(config.id),
    };
  });
  return [...assets, ...indicators];
}
