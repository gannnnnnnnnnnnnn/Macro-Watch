import { AssetCard, IndicatorList, Panel, ShellTitle, WatchlistTable } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

export default function Home() {
  const { market, macro, stress, source } = getCockpitData();
  const assets = market.assets ?? [];
  return (
    <>
      <ShellTitle title="Market cockpit" source={source} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {assets.slice(0, 8).map((asset, index) => <AssetCard key={`${asset.symbol}-${index}`} asset={asset} />)}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Watchlist preview"><WatchlistTable assets={market.watchlist?.slice(0, 5)} /></Panel>
        <Panel title="Macro status preview"><IndicatorList items={macro.groups?.Rates?.slice(0, 3) ?? macro.groups?.Liquidity?.slice(0, 3)} /></Panel>
        <Panel title="Stress radar preview"><IndicatorList items={stress.buckets?.["Volatility stress"]?.slice(0, 3)} /></Panel>
      </div>
    </>
  );
}
