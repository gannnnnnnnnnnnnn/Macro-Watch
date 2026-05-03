import Link from "next/link";
import { AssetCard, IndicatorList, MetricTile, Panel, StatusBadge } from "@/components/Cockpit";
import { PinnedWorkbench } from "@/components/PinsClient";
import { getCockpitData, getPinCatalog, resolveAllResearchItems } from "@/lib/data";
import { getFreshness } from "@/lib/freshness";
import { formatDateTime, formatDelta, formatPercent, formatValueWithUnit } from "@/lib/format";
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
  const { market, marketHistory, macro, stress, pipelineStatus } = getCockpitData();
  const assets = market.assets ?? [];
  const bySymbol = Object.fromEntries(assets.map((asset) => [asset.symbol, asset]));
  const riskAssets = [bySymbol.SPY, bySymbol.QQQ, bySymbol["BTC-USD"]].filter(Boolean);
  const commodities = [bySymbol.GLD, bySymbol.USO].filter(Boolean);
  const freshness = getFreshness(pipelineStatus.generated_at);
  const defaultPins = getPinCatalog();
  const researchItems = resolveAllResearchItems();

  const tenYear = findIndicator(macro.groups, "10Y Treasury yield");
  const twoYear = findIndicator(macro.groups, "2Y Treasury yield");
  const curve = findIndicator(macro.groups, "10Y-2Y spread");
  const fedFunds = findIndicator(macro.groups, "Effective fed funds");
  const cpi = findIndicator(macro.groups, "CPI YoY");
  const unemployment = findIndicator(macro.groups, "Unemployment rate");
  const hyOas = stress.buckets?.["Credit stress"]?.find((item) => item.name === "High yield OAS");
  const baa = stress.buckets?.["Credit stress"]?.find((item) => item.name === "Baa spread vs 10Y");
  const walcl = stress.buckets?.["Liquidity stress"]?.find((item) => item.name === "Fed total assets");
  const rrp = stress.buckets?.["Liquidity stress"]?.find((item) => item.name === "Overnight reverse repos");
  const vixStress = stress.buckets?.["Volatility stress"]?.find((item) => item.name === "VIX");

  return (
    <>
      <div className="mb-6 rounded-lg border border-line bg-panel/80 p-5 shadow-xl shadow-black/20">
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

      <Panel title="Focus now">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricTile label="VIX" value={value(vixStress)} detail="Watch item; not scored yet" badge={<StatusBadge label={vixStress?.status} real={vixStress?.real_data} />} />
          <MetricTile label="10Y-2Y spread" value={value(curve)} detail="Partial context" />
          <MetricTile label="HY OAS" value={value(hyOas)} detail={detail(hyOas, "Credit watch item")} />
          <MetricTile label="RRP / Fed assets" value={value(rrp) !== "Unavailable" ? value(rrp) : value(walcl)} detail={rrp?.real_data ? detail(rrp, "Liquidity watch item") : "Liquidity context"} />
          <MetricTile label="Data health" value={<StatusBadge label={freshness.isStale ? "stale" : "current"} real={!freshness.isStale} />} detail="Details in Data Lab" />
        </div>
      </Panel>
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <MetricTile label="Risk assets" value={`${riskAssets.filter((asset) => typeof asset?.change === "number" && asset.change >= 0).length}/${riskAssets.length} green`} detail="SPY, QQQ, BTC proxy tone" badge={<StatusBadge label="not scored yet" />} />
        <MetricTile label="Volatility" value={bySymbol.VIX?.value ?? "Unavailable"} detail="VIX via ^VIX market proxy" badge={<StatusBadge label={bySymbol.VIX?.status} real={bySymbol.VIX?.real_data} />} />
          <MetricTile label="Dollar/rates proxy" value={`UUP ${formatPercent(bySymbol.UUP?.change)} / TLT ${formatPercent(bySymbol.TLT?.change)}`} detail="Dollar and Treasury duration proxies" />
        <MetricTile label="Commodities" value={`${commodities.filter((asset) => typeof asset?.change === "number" && asset.change >= 0).length}/${commodities.length} green`} detail="GLD and USO proxies" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {assets.slice(0, 8).map((asset, index) => <AssetCard key={`${asset.symbol}-${index}`} asset={asset} history={marketHistory.symbols?.[asset.symbol ?? ""]} />)}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Panel title="Macro snapshot">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricTile label="10Y yield" value={value(tenYear)} detail={detail(tenYear)} />
            <MetricTile label="2Y yield" value={value(twoYear)} detail={detail(twoYear)} />
            <MetricTile label="10Y-2Y spread" value={value(curve)} detail={detail(curve, "Not a regime score")} />
            <MetricTile label="Fed funds" value={value(fedFunds)} detail={detail(fedFunds)} />
            <MetricTile label="CPI YoY" value={value(cpi)} detail={detail(cpi)} />
            <MetricTile label="Unemployment" value={value(unemployment)} detail={detail(unemployment)} />
          </div>
        </Panel>
        <Panel title="Stress snapshot">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile label="HY OAS" value={value(hyOas)} detail={detail(hyOas)} />
            <MetricTile label="Baa spread" value={value(baa)} detail={detail(baa)} />
            <MetricTile label="Fed balance sheet" value={value(walcl)} detail={detail(walcl)} />
            <MetricTile label="RRP" value={value(rrp)} detail={detail(rrp)} />
          </div>
          <p className="mt-4 text-sm text-slate-400">Volatility, banking, household, and leverage stress remain pending or partial, not scored.</p>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Macro detail"><IndicatorList items={[tenYear, twoYear, curve, fedFunds, cpi, unemployment].filter(Boolean) as Indicator[]} /></Panel>
        <Panel title="Stress detail"><IndicatorList items={[hyOas, baa, walcl, rrp].filter(Boolean) as Indicator[]} /></Panel>
      </div>
    </>
  );
}
