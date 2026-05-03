import Link from "next/link";
import { LightweightChart } from "@/components/LightweightChart";
import { Panel, ShellTitle, SourceBadge, StatusBadge } from "@/components/Cockpit";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { getCockpitData, getEnabledAssetCatalog, resolveAsset } from "@/lib/data";

export function generateStaticParams() {
  return getEnabledAssetCatalog().map((asset) => ({ symbol: asset.symbol }));
}

export default async function AssetDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol);
  const { market, marketHistory, pipelineStatus, source } = getCockpitData();
  const asset = resolveAsset(symbol, market);
  const history = asset.symbol ? marketHistory.symbols?.[asset.symbol]?.rows ?? [] : [];
  const recent = history.slice(-12).reverse();
  const change = typeof asset.change === "number" ? `${asset.change > 0 ? "+" : ""}${asset.change.toFixed(2)}%` : "Unavailable";

  return (
    <>
      <ShellTitle title={asset.symbol ?? symbol} eyebrow={asset.group ?? "Asset detail"} source={source} />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/markets" className="rounded border border-line px-3 py-2 text-slate-300 hover:bg-panel hover:text-white">Back to Markets</Link>
        <SourceBadge source={source} />
        <StatusBadge label={asset.status} real={asset.real_data} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.55fr]">
        <Panel title="Local history chart">
          <div className="mb-4">
            <p className="text-2xl font-semibold text-white">{asset.name ?? "Unavailable"}</p>
            <p className="mt-1 text-sm text-slate-400">{asset.proxy ? `Provider symbol ${asset.proxy}` : "Provider symbol unavailable"}</p>
          </div>
          <LightweightChart market={history} height={360} />
        </Panel>
        <Panel title="Latest context">
          <div className="space-y-3">
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Latest</p><p className="mt-1 text-3xl font-semibold text-white">{asset.value ?? "Unavailable"}{asset.unit ? <span className="ml-1 text-sm text-slate-500">{asset.unit}</span> : null}</p></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Change</p><p className="mt-1 text-xl text-white">{change}</p></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Provider/date</p><p className="mt-1 text-sm text-slate-300">{asset.provider ?? "N/A"} · {asset.latest_date ?? "N/A"}</p></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Freshness</p><p className="mt-1 text-sm text-slate-300">{pipelineStatus.generated_at ?? "Run pipeline"}</p></div>
          </div>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.65fr]">
        <Panel title="Recent rows">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500"><tr><th className="py-2">Date</th><th>Open</th><th>High</th><th>Low</th><th>Close</th><th>Volume</th></tr></thead>
              <tbody>
                {(recent.length ? recent : [{ date: "Unavailable" }]).map((row, index) => (
                  <tr key={`${row.date}-${index}`} className="border-t border-line">
                    <td className="py-3 font-medium text-white">{row.date ?? "N/A"}</td>
                    <td>{row.open ?? "N/A"}</td>
                    <td>{row.high ?? "N/A"}</td>
                    <td>{row.low ?? "N/A"}</td>
                    <td>{row.close ?? "N/A"}</td>
                    <td className="text-slate-400">{row.volume ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="TradingView reference">
          <TradingViewWidget symbol={asset.symbol} />
          <p className="mt-3 text-xs text-slate-500">External public reference only. Primary chart uses local generated JSON.</p>
        </Panel>
      </div>
    </>
  );
}
