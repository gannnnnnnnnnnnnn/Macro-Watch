import Link from "next/link";
import { formatDate, formatDelta, formatPercent, formatValueWithUnit } from "@/lib/format";
import type { Asset, HistoryRow, Indicator, SourceName, SymbolHistory } from "@/lib/types";

export function SourceBadge({ source }: { source: SourceName | string | undefined }) {
  const label = source ?? "unavailable";
  const tone = label === "generated" ? "bg-emerald-500/15 text-emerald-300" : label === "mixed" ? "bg-amber-500/15 text-amber-300" : "bg-slate-500/15 text-slate-300";
  return <span className={`inline-flex self-start rounded px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${tone}`}>{label}</span>;
}

export function StatusBadge({ label, real }: { label?: string; real?: boolean }) {
  const text = label ?? "unavailable";
  const tone = real || text === "ok" || text === "generated" ? "bg-emerald-500/15 text-emerald-300" : text.includes("placeholder") || text.includes("pending") || text === "warning" ? "bg-amber-500/15 text-amber-300" : "bg-slate-500/15 text-slate-300";
  return <span className={`inline-flex self-start rounded px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${tone}`}>{real ? "real" : text}</span>;
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

export function MetricTile({ label, value, detail, badge }: { label: string; value: React.ReactNode; detail?: string; badge?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        {badge}
      </div>
      <div className="mt-3 break-words text-2xl font-semibold text-white">{value}</div>
      {detail ? <p className="mt-1 break-words text-sm text-slate-400">{detail}</p> : null}
    </div>
  );
}

export function MiniLineChart({ rows, positive }: { rows?: HistoryRow[]; positive?: boolean }) {
  return (
    <div className="rounded border border-line bg-ink p-4">
      <Sparkline rows={rows} positive={positive} />
    </div>
  );
}

export function Sparkline({ rows, positive }: { rows?: HistoryRow[]; positive?: boolean }) {
  const values = (rows ?? []).map((row) => row.close).filter((value): value is number => typeof value === "number");
  if (values.length < 2) return <div className="flex h-12 items-center text-xs text-slate-500">No history</div>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 38 - ((value - min) / span) * 32;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 42" className="h-12 w-full" role="img" aria-label="Recent price sparkline">
      <polyline points={points} fill="none" stroke={positive ? "#32d583" : "#fb7185"} strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function AssetCard({ asset, history }: { asset: Asset; history?: SymbolHistory }) {
  const change = typeof asset.change === "number" ? asset.change : null;
  const tone = change === null ? "text-slate-400" : change >= 0 ? "text-gain" : "text-loss";
  return (
    <div className="rounded-lg border border-line bg-[#0c1018] p-4 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{asset.label ?? asset.symbol ?? asset.proxy ?? "N/A"}</p>
          <p className="mt-1 text-xs text-slate-400">{asset.name ?? "Unavailable"}</p>
        </div>
        <span className={tone}>{change === null ? "N/A" : formatPercent(change)}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-white">{formatValueWithUnit(asset.value, asset.unit)}</p>
      <div className="mt-3"><Sparkline rows={history?.rows} positive={(change ?? 0) >= 0} /></div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>{asset.latest_date ? formatDate(asset.latest_date) : "date N/A"}</span>
        <StatusBadge label={asset.status} real={asset.real_data} />
      </div>
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
            <div className="flex flex-wrap items-center gap-2">
              {item.href ? (
                <Link href={item.href} className="font-medium text-white hover:text-cyan-300">{item.name ?? item.label ?? "Unavailable"}</Link>
              ) : (
                <p className="font-medium text-white">{item.name ?? item.label ?? "Unavailable"}</p>
              )}
              <StatusBadge label={item.status} real={item.real_data} />
            </div>
            <p className="mt-1 text-xs text-slate-400">{item.note ?? item.status ?? "Not wired yet"}</p>
            <p className="mt-1 text-xs text-slate-500">{item.provider ?? "Provider N/A"}{item.latest_date ? ` · ${formatDate(item.latest_date)}` : ""}</p>
            {typeof item.delta === "number" ? <p className="mt-1 text-xs text-slate-500">Δ previous {formatDelta(item.delta, item.unit ?? "")} · {item.one_year_delta_label ?? "context only"}</p> : item.delta_label ? <p className="mt-1 text-xs text-slate-500">{item.delta_label}</p> : null}
          </div>
          <p className="whitespace-nowrap text-sm text-slate-200">{formatValueWithUnit(item.value, item.unit)}</p>
        </div>
      ))}
    </div>
  );
}

export function WatchlistTable({ assets, history }: { assets: Asset[] | undefined; history?: Record<string, SymbolHistory> }) {
  const rows = assets?.length ? assets : [{ symbol: "N/A", name: "Unavailable", status: "missing" }];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr><th className="py-2">Symbol</th><th>Name</th><th>Latest</th><th>Change</th><th>Provider</th><th>Date</th><th>Data</th><th>Trend</th></tr>
        </thead>
        <tbody>
          {rows.map((asset, index) => (
            <tr key={`${asset.symbol}-${index}`} className="border-t border-line">
              <td className="py-3 font-medium text-white">{asset.symbol ?? asset.proxy ?? "N/A"}</td>
              <td className="text-slate-300">{asset.name ?? "Unavailable"}</td>
              <td>{formatValueWithUnit(asset.value, asset.unit)}</td>
              <td className={typeof asset.change === "number" && asset.change < 0 ? "text-loss" : "text-gain"}>{typeof asset.change === "number" ? formatPercent(asset.change) : "N/A"}</td>
              <td className="text-slate-400">{asset.provider ?? "N/A"}</td>
              <td className="text-slate-400">{asset.latest_date ? formatDate(asset.latest_date) : "N/A"}</td>
              <td><StatusBadge label={asset.status} real={asset.real_data} /></td>
              <td className="w-32"><Sparkline rows={history?.[asset.symbol ?? ""]?.rows} positive={(asset.change ?? 0) >= 0} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
