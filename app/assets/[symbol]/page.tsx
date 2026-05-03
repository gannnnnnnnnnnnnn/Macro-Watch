import Link from "next/link";
import { LightweightChart } from "@/components/LightweightChart";
import { Panel, ShellTitle, StatusBadge } from "@/components/Cockpit";
import { PinButton } from "@/components/PinsClient";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { getCockpitData, getEnabledAssetCatalog, resolveAsset } from "@/lib/data";
import { formatCompact, formatDate, formatDateTime, formatNumber, formatPercent, formatValueWithUnit } from "@/lib/format";

export default async function AssetDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol);
  const { market, marketHistory, pipelineStatus } = getCockpitData();
  const asset = resolveAsset(symbol, market);
  const history = asset.symbol ? marketHistory.symbols?.[asset.symbol]?.rows ?? [] : [];
  const recent = history.slice(-12).reverse();
  const change = formatPercent(asset.change);

  return (
    <>
      <ShellTitle title={asset.symbol ?? symbol} eyebrow={asset.group ?? "Asset detail"} />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/markets" className="rounded border border-line px-3 py-2 text-slate-300 hover:bg-panel hover:text-white">Back to Markets</Link>
        <StatusBadge label={asset.status} real={asset.real_data} />
        {asset.symbol ? <PinButton target={{ type: "asset", id: asset.symbol }} /> : null}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.55fr]">
        <Panel title="Local history chart">
          <div className="mb-4">
            <p className="text-2xl font-semibold text-white">{asset.name ?? "Unavailable"}</p>
            <p className="mt-1 text-sm text-slate-400">{asset.latest_date ? `Updated ${formatDate(asset.latest_date)}` : "Run pipeline for fresh local history"}</p>
          </div>
          <LightweightChart market={history} height={420} unit={asset.unit} defaultRange="3Y" showOverlays defaultOverlays={["SMA50", "SMA200"]} />
        </Panel>
        <Panel title="Latest context">
          <div className="space-y-3">
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Latest</p><p className="mt-1 text-3xl font-semibold text-white">{formatValueWithUnit(asset.value, asset.unit)}</p></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Change</p><p className="mt-1 text-xl text-white">{change}</p></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Updated</p><p className="mt-1 text-sm text-slate-300">{asset.latest_date ? formatDate(asset.latest_date) : "N/A"}</p></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Local run</p><p className="mt-1 break-words text-xs text-slate-300">{formatDateTime(pipelineStatus.generated_at)}</p></div>
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
                    <td className="whitespace-nowrap py-3 font-medium text-white">{row.date ?? "N/A"}</td>
                    <td>{formatNumber(row.open)}</td>
                    <td>{formatNumber(row.high)}</td>
                    <td>{formatNumber(row.low)}</td>
                    <td>{formatNumber(row.close)}</td>
                    <td className="text-slate-400">{formatCompact(row.volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <details className="rounded-lg border border-line bg-panel p-4 shadow-xl shadow-black/20">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-slate-300">External TradingView reference</summary>
          <div className="mt-3">
            <TradingViewWidget symbol={asset.symbol} />
            <p className="mt-3 text-xs text-slate-500">External public reference only. Primary chart uses local generated JSON.</p>
          </div>
        </details>
      </div>
    </>
  );
}

export function generateStaticParams() {
  return getEnabledAssetCatalog().map((asset) => ({ symbol: asset.symbol }));
}
