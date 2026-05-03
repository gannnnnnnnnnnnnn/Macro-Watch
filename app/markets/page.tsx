import { AssetCard, Panel, ShellTitle, Sparkline, StatusBadge, WatchlistTable } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

export default function MarketsPage() {
  const { market, marketHistory, source } = getCockpitData();
  const first = market.assets?.[0];
  const firstHistory = first?.symbol ? marketHistory.symbols?.[first.symbol] : undefined;
  return (
    <>
      <ShellTitle title="Markets" eyebrow="Overview" source={source} />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Panel title="Market overview">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(market.assets ?? []).slice(0, 8).map((asset, index) => <AssetCard key={`${asset.symbol}-${index}`} asset={asset} history={marketHistory.symbols?.[asset.symbol ?? ""]} />)}
          </div>
        </Panel>
        <Panel title="Selected asset">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold text-white">{first?.symbol ?? "N/A"}</p>
                <p className="mt-1 text-sm text-slate-400">{first?.name ?? "Unavailable"}</p>
              </div>
              <StatusBadge label={first?.status} real={first?.real_data} />
            </div>
            <p className="text-4xl font-semibold text-white">{first?.value ?? "Unavailable"}<span className="ml-2 text-sm text-slate-500">{first?.unit ?? ""}</span></p>
            <Sparkline rows={firstHistory?.rows} positive={(first?.change ?? 0) >= 0} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded border border-line bg-ink p-3"><p className="text-slate-500">Provider</p><p className="text-white">{first?.provider ?? "N/A"}</p></div>
              <div className="rounded border border-line bg-ink p-3"><p className="text-slate-500">Latest date</p><p className="text-white">{first?.latest_date ?? "N/A"}</p></div>
            </div>
          </div>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Watchlist table"><WatchlistTable assets={market.watchlist} history={marketHistory.symbols} /></Panel>
        <Panel title="Major assets">
          <div className="grid gap-3 sm:grid-cols-2">{(market.assets ?? []).slice(0, 4).map((asset, index) => <AssetCard key={`${asset.symbol}-major-${index}`} asset={asset} history={marketHistory.symbols?.[asset.symbol ?? ""]} />)}</div>
        </Panel>
      </div>
    </>
  );
}
