import type { Asset, Indicator, SourceName } from "@/lib/types";

export function SourceBadge({ source }: { source: SourceName | string | undefined }) {
  const label = source ?? "unavailable";
  const tone = label === "generated" ? "bg-emerald-500/15 text-emerald-300" : label === "mixed" ? "bg-amber-500/15 text-amber-300" : "bg-slate-500/15 text-slate-300";
  return <span className={`rounded px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${tone}`}>{label}</span>;
}

export function ShellTitle({ title, eyebrow, source }: { title: string; eyebrow?: string; source?: SourceName | string }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{eyebrow ?? "Local macro cockpit"}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
      </div>
      {source ? <SourceBadge source={source} /> : null}
    </div>
  );
}

export function Panel({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-4 shadow-xl shadow-black/20">
      {title ? <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">{title}</h2> : null}
      {children}
    </section>
  );
}

export function AssetCard({ asset }: { asset: Asset }) {
  const change = typeof asset.change === "number" ? asset.change : null;
  const tone = change === null ? "text-slate-400" : change >= 0 ? "text-gain" : "text-loss";
  return (
    <div className="rounded-lg border border-line bg-[#0c1018] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{asset.symbol ?? asset.proxy ?? "N/A"}</p>
          <p className="mt-1 text-xs text-slate-400">{asset.name ?? "Unavailable"}</p>
        </div>
        <span className={tone}>{change === null ? "N/A" : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-white">{asset.value ?? "Unavailable"}{asset.unit ? <span className="text-sm text-slate-400"> {asset.unit}</span> : null}</p>
      <p className="mt-2 text-xs text-slate-500">{asset.status ?? "ready"}</p>
    </div>
  );
}

export function IndicatorList({ items }: { items: Indicator[] | undefined }) {
  const safeItems = items?.length ? items : [{ name: "Unavailable", status: "missing" }];
  return (
    <div className="space-y-3">
      {safeItems.map((item, index) => (
        <div key={`${item.name ?? "indicator"}-${index}`} className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
          <div>
            <p className="font-medium text-white">{item.name ?? "Unavailable"}</p>
            <p className="text-xs text-slate-400">{item.note ?? item.status ?? "No note available"}</p>
          </div>
          <p className="whitespace-nowrap text-sm text-slate-200">{item.value ?? "N/A"}{item.unit ? ` ${item.unit}` : ""}</p>
        </div>
      ))}
    </div>
  );
}

export function WatchlistTable({ assets }: { assets: Asset[] | undefined }) {
  const rows = assets?.length ? assets : [{ symbol: "N/A", name: "Unavailable", status: "missing" }];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr><th className="py-2">Symbol</th><th>Name</th><th>Value</th><th>Change</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rows.map((asset, index) => (
            <tr key={`${asset.symbol}-${index}`} className="border-t border-line">
              <td className="py-3 font-medium text-white">{asset.symbol ?? asset.proxy ?? "N/A"}</td>
              <td className="text-slate-300">{asset.name ?? "Unavailable"}</td>
              <td>{asset.value ?? "N/A"}{asset.unit ? ` ${asset.unit}` : ""}</td>
              <td className={typeof asset.change === "number" && asset.change < 0 ? "text-loss" : "text-gain"}>{typeof asset.change === "number" ? `${asset.change > 0 ? "+" : ""}${asset.change.toFixed(2)}%` : "N/A"}</td>
              <td className="text-slate-400">{asset.status ?? "ready"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
