import { AssetCard, IndicatorList, Panel, ShellTitle, SourceBadge, StatusBadge, WatchlistTable } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

export default function Home() {
  const { market, marketHistory, macro, stress, source } = getCockpitData();
  const assets = market.assets ?? [];
  const bySymbol = Object.fromEntries(assets.map((asset) => [asset.symbol, asset]));
  const riskAssets = [bySymbol.SPY, bySymbol.QQQ, bySymbol["BTC-USD"]].filter(Boolean);
  const commodities = [bySymbol.GLD, bySymbol.USO].filter(Boolean);
  return (
    <>
      <div className="mb-6 rounded-lg border border-line bg-panel/80 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">OpenBB-powered local cockpit</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-5xl">Market pulse, macro context, stress watch.</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-400">Generated JSON first, mock fallback second. Built for quick local scanning without broker, auth, database, or AI layers.</p>
          </div>
          <SourceBadge source={source} />
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Risk assets</p><p className="mt-1 text-lg text-white">{riskAssets.length ? "Tracking" : "Unavailable"}</p></div>
          <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Volatility</p><p className="mt-1 text-lg text-white">{bySymbol.VIX?.value ?? "Unavailable"}</p></div>
          <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Dollar/rates</p><p className="mt-1 text-lg text-white">UUP {bySymbol.UUP?.value ?? "N/A"} · TLT {bySymbol.TLT?.value ?? "N/A"}</p></div>
          <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">History</p><p className="mt-1"><StatusBadge label={marketHistory.status} real={marketHistory.real_data} /></p></div>
        </div>
      </div>
      <ShellTitle title="Market regime" source={source} />
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <Panel title="Risk assets"><p className="text-2xl font-semibold text-white">{riskAssets.map((asset) => asset?.change).filter((v) => typeof v === "number" && v >= 0).length}/{riskAssets.length} green</p><p className="mt-1 text-sm text-slate-400">SPY, QQQ, BTC proxy tone</p></Panel>
        <Panel title="Volatility"><p className="text-2xl font-semibold text-white">{bySymbol.VIX?.value ?? "Unavailable"}</p><p className="mt-1 text-sm text-slate-400">VIX via ^VIX when available</p></Panel>
        <Panel title="Dollar/rates"><p className="text-2xl font-semibold text-white">{bySymbol.UUP?.change ?? "N/A"}% / {bySymbol.TLT?.change ?? "N/A"}%</p><p className="mt-1 text-sm text-slate-400">UUP and TLT proxies</p></Panel>
        <Panel title="Commodities"><p className="text-2xl font-semibold text-white">{commodities.map((asset) => asset?.change).filter((v) => typeof v === "number" && v >= 0).length}/{commodities.length} green</p><p className="mt-1 text-sm text-slate-400">Gold and oil proxies</p></Panel>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {assets.slice(0, 8).map((asset, index) => <AssetCard key={`${asset.symbol}-${index}`} asset={asset} history={marketHistory.symbols?.[asset.symbol ?? ""]} />)}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Watchlist preview"><WatchlistTable assets={market.watchlist?.slice(0, 5)} history={marketHistory.symbols} /></Panel>
        <Panel title="Macro status preview"><IndicatorList items={macro.groups?.Rates?.slice(0, 3) ?? macro.groups?.Liquidity?.slice(0, 3)} /></Panel>
        <Panel title="Stress radar preview"><IndicatorList items={stress.buckets?.["Volatility stress"]?.slice(0, 3)} /></Panel>
      </div>
    </>
  );
}
