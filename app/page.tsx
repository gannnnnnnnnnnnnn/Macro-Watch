import Link from "next/link";
import { AssetCard, MetricTile, Panel } from "@/components/Cockpit";
import { PinnedWorkbench } from "@/components/PinsClient";
import { StressRadarClient } from "@/components/StressRadarClient";
import { getCockpitData, getPinCatalog, resolveAllResearchItems } from "@/lib/data";
import { getFreshness } from "@/lib/freshness";
import { formatDateTime, formatDelta, formatValueWithUnit } from "@/lib/format";
import type { Indicator } from "@/lib/types";

function findIndicator(groups: Record<string, Indicator[]> | undefined, name: string) {
  return Object.values(groups ?? {}).flat().find((item) => item.name === name);
}

function value(item: Indicator | undefined) {
  if (!item) return "Unavailable";
  return formatValueWithUnit(item.value, item.unit);
}

function detail(item: Indicator | undefined, fallback = "context only") {
  return typeof item?.delta === "number" ? `Δ previous ${formatDelta(item.delta, item.unit ?? "")} · ${item.one_year_delta_label ?? fallback}` : item?.latest_date ?? fallback;
}

export default function Home() {
  const { market, marketHistory, indicatorHistory, macro, stress, pipelineStatus } = getCockpitData();
  const assets = market.assets ?? [];
  const bySymbol = Object.fromEntries(assets.map((asset) => [asset.symbol, asset]));
  const freshness = getFreshness(pipelineStatus.generated_at);
  const defaultPins = getPinCatalog();
  const researchItems = resolveAllResearchItems();
  const pulseAssets = ["SPY", "QQQ", "VIX", "TLT", "UUP", "GLD", "BTC-USD"].map((symbol) => bySymbol[symbol]).filter(Boolean);

  const tenYear = findIndicator(macro.groups, "10Y Treasury yield");
  const twoYear = findIndicator(macro.groups, "2Y Treasury yield");
  const curve = findIndicator(macro.groups, "10Y-2Y spread");
  const fedFunds = findIndicator(macro.groups, "Effective fed funds");
  const cpi = findIndicator(macro.groups, "CPI YoY");
  const hyOas = stress.buckets?.["Credit stress"]?.find((item) => item.name === "High yield OAS");
  const rrp = stress.buckets?.["Liquidity stress"]?.find((item) => item.name === "Overnight reverse repos");

  return (
    <>
      <div className="mb-5 rounded-lg border border-line bg-panel/80 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Research home</p>
            <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">Macro-Watch</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-400">
              Macro-first market context, pinned indicators, and stress watch items. Context only, not scored.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-ink px-4 py-3 text-sm text-slate-400 xl:min-w-[320px]">
            <p className="text-xs uppercase tracking-wide text-slate-500">Updated</p>
            <p className="mt-1 text-slate-200">{formatDateTime(pipelineStatus.generated_at)}{freshness.isStale ? " · stale" : ""}</p>
            <Link href="/data-lab" className="mt-2 inline-flex text-xs text-cyan-300 hover:text-cyan-100">View diagnostics</Link>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <PinnedWorkbench defaultPins={defaultPins} items={researchItems} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.72fr]">
        <Panel title="Market pulse">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pulseAssets.map((asset) => (
              <Link key={asset.symbol} href={`/assets/${encodeURIComponent(asset.symbol ?? "")}`} className="block">
                <AssetCard asset={asset} history={marketHistory.symbols?.[asset.symbol ?? ""]} />
              </Link>
            ))}
          </div>
          <Link href="/markets" className="mt-4 inline-flex rounded border border-line px-3 py-2 text-sm text-slate-300 hover:bg-ink hover:text-white">Open Markets</Link>
        </Panel>
        <StressRadarClient stress={stress} indicatorHistory={indicatorHistory} marketHistory={marketHistory} compact />
      </div>

      <div className="mt-6">
        <Panel title="Macro snapshot / what changed">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
            <MetricTile label="10Y" value={value(tenYear)} detail={detail(tenYear)} />
            <MetricTile label="2Y" value={value(twoYear)} detail={detail(twoYear)} />
            <MetricTile label="10Y-2Y" value={value(curve)} detail={detail(curve, "Context only")} />
            <MetricTile label="Fed Funds" value={value(fedFunds)} detail={detail(fedFunds)} />
            <MetricTile label="CPI YoY" value={value(cpi)} detail={detail(cpi)} />
            <MetricTile label="HY OAS" value={value(hyOas)} detail={detail(hyOas)} />
            <MetricTile label="RRP" value={value(rrp)} detail={detail(rrp)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/macro" className="rounded border border-line px-3 py-2 text-sm text-slate-300 hover:bg-ink hover:text-white">Open Macro</Link>
            <Link href="/stress" className="rounded border border-line px-3 py-2 text-sm text-slate-300 hover:bg-ink hover:text-white">Open Stress</Link>
          </div>
        </Panel>
      </div>
    </>
  );
}
