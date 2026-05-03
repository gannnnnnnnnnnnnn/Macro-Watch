import Link from "next/link";
import { getCockpitData } from "@/lib/data";
import { getFreshness } from "@/lib/freshness";
import { SourceBadge, StatusBadge } from "./Cockpit";

const nav = [
  ["/", "Dashboard"],
  ["/markets", "Markets"],
  ["/macro", "Macro"],
  ["/stress", "Stress"],
  ["/data-lab", "Data Lab"],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { market, pipelineStatus, source } = getCockpitData();
  const realMarkets = (market.assets ?? []).filter((asset) => asset.real_data).length;
  const fredReal = Object.values(pipelineStatus.fred_series ?? {}).filter((series) => series.real_data).length;
  const freshness = getFreshness(pipelineStatus.generated_at);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="w-screen max-w-full min-w-0 overflow-hidden border-b border-line bg-[#080b12]/95 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:border-b-0 lg:border-r lg:overflow-visible">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded border border-cyan-400/30 bg-cyan-400/10 text-sm font-semibold text-cyan-200">MW</span>
            <span>
              <span className="block font-semibold text-white">Macro-Watch</span>
              <span className="block text-xs text-slate-500">Local macro cockpit</span>
            </span>
          </Link>
          <SourceBadge source={source} />
        </div>
        <nav className="flex min-w-0 gap-1 overflow-x-auto px-3 pb-4 text-sm text-slate-300 lg:block lg:space-y-1 lg:overflow-visible">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="block whitespace-nowrap rounded border border-transparent px-3 py-2 hover:border-line hover:bg-panel hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-line p-4 lg:block">
          <p className="text-xs uppercase tracking-wide text-slate-500">Pipeline</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3"><span className="text-slate-400">Status</span><StatusBadge label={pipelineStatus.status} /></div>
            <div className="flex items-center justify-between gap-3"><span className="text-slate-400">Freshness</span><StatusBadge label={freshness.label} real={!freshness.isStale} /></div>
            <div className="flex items-center justify-between gap-3"><span className="text-slate-400">Markets</span><span className="text-white">{realMarkets}</span></div>
            <div className="flex items-center justify-between gap-3"><span className="text-slate-400">FRED</span><span className="text-white">{fredReal}</span></div>
          </div>
        </div>
      </aside>
      <div className="w-screen max-w-full min-w-0 overflow-x-hidden lg:w-auto">
        <TopStatusStrip />
        <main className="mx-auto w-screen max-w-full overflow-x-hidden px-4 py-6 sm:py-8 lg:w-auto lg:max-w-7xl">{children}</main>
      </div>
    </div>
  );
}

export function TopStatusStrip() {
  const { market, pipelineStatus, source } = getCockpitData();
  const realMarkets = (market.assets ?? []).filter((asset) => asset.real_data).length;
  const fredReal = Object.values(pipelineStatus.fred_series ?? {}).filter((series) => series.real_data).length;
  const freshness = getFreshness(pipelineStatus.generated_at);
  return (
    <div className="w-screen max-w-full overflow-hidden border-b border-line bg-[#080b12]/85 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur lg:w-auto">
      <div className="mx-auto grid min-w-0 max-w-7xl gap-2 text-xs text-slate-400 sm:grid-cols-2 xl:grid-cols-5">
        <div className="flex min-w-0 flex-col items-start justify-between gap-2 rounded border border-line bg-ink px-3 py-2 sm:flex-row sm:items-center"><span className="shrink-0">Source</span><SourceBadge source={source} /></div>
        <div className="flex min-w-0 flex-col items-start justify-between gap-2 rounded border border-line bg-ink px-3 py-2 sm:flex-row sm:items-center"><span className="shrink-0">Generated</span><span className="min-w-0 max-w-full truncate text-slate-200 sm:text-right" title={pipelineStatus.generated_at ?? "Unavailable"}>{pipelineStatus.generated_at ?? "Unavailable"}</span></div>
        <div className="flex min-w-0 flex-col items-start justify-between gap-2 rounded border border-line bg-ink px-3 py-2 sm:flex-row sm:items-center"><span className="shrink-0">Freshness</span><StatusBadge label={freshness.label} real={!freshness.isStale} /></div>
        <div className="flex min-w-0 flex-col items-start justify-between gap-2 rounded border border-line bg-ink px-3 py-2 sm:flex-row sm:items-center"><span className="shrink-0">Real market symbols</span><span className="text-slate-200">{realMarkets}</span></div>
        <div className="flex min-w-0 flex-col items-start justify-between gap-2 rounded border border-line bg-ink px-3 py-2 sm:flex-row sm:items-center"><span className="shrink-0">Real FRED series</span><span className="text-slate-200">{fredReal}</span></div>
      </div>
    </div>
  );
}
