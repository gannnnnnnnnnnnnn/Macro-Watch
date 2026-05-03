import { AssetCard, IndicatorList, MetricTile, Panel, ShellTitle, SourceBadge, StatusBadge } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";
import { getFreshness } from "@/lib/freshness";
import type { Indicator } from "@/lib/types";

function findIndicator(groups: Record<string, Indicator[]> | undefined, name: string) {
  return Object.values(groups ?? {}).flat().find((item) => item.name === name);
}

function value(item: Indicator | undefined) {
  if (!item) return "Unavailable";
  return `${item.value ?? "Unavailable"}${item.unit ? ` ${item.unit}` : ""}`;
}

function detail(item: Indicator | undefined, fallback = "context only") {
  return item?.delta_label ? `${item.delta_label} · ${item.one_year_delta_label ?? fallback}` : item?.latest_date ?? fallback;
}

export default function Home() {
  const { market, marketHistory, macro, stress, pipelineStatus, source } = getCockpitData();
  const assets = market.assets ?? [];
  const bySymbol = Object.fromEntries(assets.map((asset) => [asset.symbol, asset]));
  const riskAssets = [bySymbol.SPY, bySymbol.QQQ, bySymbol["BTC-USD"]].filter(Boolean);
  const commodities = [bySymbol.GLD, bySymbol.USO].filter(Boolean);
  const fredReal = Object.values(pipelineStatus.fred_series ?? {}).filter((series) => series.real_data).length;
  const realMarkets = assets.filter((asset) => asset.real_data).length;
  const freshness = getFreshness(pipelineStatus.generated_at);

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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">OpenBB + FRED local research cockpit</p>
            <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">Macro-Watch</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-400">
              Generated market, macro, and stress JSON is active. The cockpit is not scoring regimes yet; pending areas stay labeled.
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2 xl:min-w-[620px] xl:grid-cols-5">
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Data source</p><div className="mt-2"><SourceBadge source={source} /></div></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Last generated</p><p className="mt-2 text-slate-200">{pipelineStatus.generated_at ?? "Unavailable"}</p></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Real markets</p><p className="mt-2 text-slate-200">{realMarkets}/{assets.length}</p></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Real FRED series</p><p className="mt-2 text-slate-200">{fredReal}</p></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Freshness</p><div className="mt-2"><StatusBadge label={freshness.label} real={!freshness.isStale} /></div></div>
          </div>
        </div>
      </div>

      <ShellTitle title="Market pulse" source={source} />
      <Panel title="Focus now">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricTile label="VIX" value={value(vixStress)} detail="Watch item; not scored yet" badge={<StatusBadge label={vixStress?.status} real={vixStress?.real_data} />} />
          <MetricTile label="10Y-2Y spread" value={value(curve)} detail="Partial context" />
          <MetricTile label="HY OAS" value={value(hyOas)} detail={detail(hyOas, "Credit watch item")} />
          <MetricTile label="RRP" value={value(rrp) !== "Unavailable" ? value(rrp) : value(walcl)} detail={rrp?.real_data ? detail(rrp, "Liquidity watch item") : "Fed assets fallback"} />
          <MetricTile label="Pipeline" value={<StatusBadge label={pipelineStatus.status} />} detail="Generated data path" />
        </div>
      </Panel>
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <MetricTile label="Risk assets" value={`${riskAssets.filter((asset) => typeof asset?.change === "number" && asset.change >= 0).length}/${riskAssets.length} green`} detail="SPY, QQQ, BTC proxy tone" badge={<StatusBadge label="not scored yet" />} />
        <MetricTile label="Volatility" value={bySymbol.VIX?.value ?? "Unavailable"} detail="VIX via ^VIX market proxy" badge={<StatusBadge label={bySymbol.VIX?.status} real={bySymbol.VIX?.real_data} />} />
        <MetricTile label="Dollar/rates proxy" value={`UUP ${bySymbol.UUP?.change ?? "N/A"}% / TLT ${bySymbol.TLT?.change ?? "N/A"}%`} detail="Dollar and Treasury duration proxies" />
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
