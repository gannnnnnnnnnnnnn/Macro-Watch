import { AssetCard, Panel, ShellTitle, WatchlistTable } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

export default function MarketsPage() {
  const { market, source } = getCockpitData();
  return (
    <>
      <ShellTitle title="Markets" eyebrow="Overview" source={source} />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Panel title="Market overview">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(market.assets ?? []).slice(0, 8).map((asset, index) => <AssetCard key={`${asset.symbol}-${index}`} asset={asset} />)}
          </div>
        </Panel>
        <Panel title="Chart placeholder">
          <div className="flex h-72 items-center justify-center rounded border border-dashed border-line bg-ink text-sm text-slate-400">
            Chart area unavailable in v0
          </div>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Watchlist table"><WatchlistTable assets={market.watchlist} /></Panel>
        <Panel title="Major assets">
          <div className="grid gap-3 sm:grid-cols-2">{(market.assets ?? []).slice(0, 4).map((asset, index) => <AssetCard key={`${asset.symbol}-major-${index}`} asset={asset} />)}</div>
        </Panel>
      </div>
    </>
  );
}
