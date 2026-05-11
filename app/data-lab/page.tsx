import { MetricTile, Panel, ShellTitle, SourceBadge, StatusBadge } from "@/components/Cockpit";
import { getAssetCatalog, getCockpitData, getEnabledAssetCatalog, getEnabledIndicatorCatalog } from "@/lib/data";
import { getFreshness } from "@/lib/freshness";
import { formatDate, formatDateTime } from "@/lib/format";
import type { PipelineStatus } from "@/lib/types";

type FileStatus = NonNullable<PipelineStatus["files"]>[string];

const outputFiles = [
  "market_snapshot.json",
  "market_history.json",
  "macro_indicators.json",
  "stress_indicators.json",
  "indicator_history.json",
  "coverage_summary.json",
  "signal_cards.json",
  "evidence_cards.json",
  "stress_engine.json",
  "pipeline_status.json",
];

function warningCount(status: PipelineStatus, files: Record<string, FileStatus>) {
  return (status.warnings?.length ?? 0) + Object.values(files).reduce((sum, file) => sum + (file.warnings?.length ?? 0), 0);
}

function outputCount(name: string, data: ReturnType<typeof getCockpitData>) {
  if (name === "market_snapshot.json") return data.market.assets?.length ?? 0;
  if (name === "market_history.json") return Object.keys(data.marketHistory.symbols ?? {}).length;
  if (name === "macro_indicators.json") return Object.values(data.macro.groups ?? {}).reduce((sum, group) => sum + group.length, 0);
  if (name === "stress_indicators.json") return Object.values(data.stress.buckets ?? {}).reduce((sum, bucket) => sum + bucket.length, 0);
  if (name === "indicator_history.json") return Object.keys(data.indicatorHistory.indicators ?? {}).length;
  if (name === "coverage_summary.json") return (data.coverage.assets?.groups?.length ?? 0) + (data.coverage.indicators?.groups?.length ?? 0);
  if (name === "signal_cards.json") return data.signalCards.cards?.length ?? 0;
  if (name === "evidence_cards.json") return data.evidenceCards.cards?.length ?? 0;
  if (name === "stress_engine.json") return data.stressEngine.buckets?.length ?? 0;
  if (name === "pipeline_status.json") return data.pipelineStatus.providers?.length ?? 0;
  return 0;
}

function dataKind(file?: FileStatus) {
  if (!file) return "fallback";
  if (file.real_data) return "real";
  if (file.status === "ok" || file.status === "generated") return "generated";
  return "fallback";
}

export default function DataLabPage() {
  const data = getCockpitData();
  const { pipelineStatus, source, coverage, signalCards, evidenceCards, stressEngine } = data;
  const freshness = getFreshness(pipelineStatus.generated_at);
  const files = pipelineStatus.files ?? {};
  const providers = pipelineStatus.providers?.length
    ? pipelineStatus.providers
    : [
        { name: "OpenBB/yfinance", status: "unavailable", note: "Run the local pipeline to report market provider status." },
        { name: "FRED", status: "unavailable", note: "Run the local pipeline to report macro provider status." },
        { name: "generated JSON", status: source === "generated" || source === "mixed" ? "available" : "missing", note: "Frontend reads generated JSON first when complete." },
        { name: "mock fallback", status: "available", note: "Committed fallback data keeps the app runnable." },
      ];
  const fredEntries = Object.entries(pipelineStatus.fred_series ?? {});
  const fredRows = fredEntries.length
    ? fredEntries
    : ([["N/A", { status: "unavailable", provider: "FRED", latest_date: null, real_data: false }]] as typeof fredEntries);
  const warnings = [
    ...(pipelineStatus.warnings ?? []),
    ...(coverage.warnings ?? []),
    ...Object.entries(files).flatMap(([name, file]) => (file.warnings ?? []).map((warning) => `${name}: ${warning}`)),
  ];
  const unavailableAssets = (pipelineStatus.symbols ?? []).filter((symbol) => symbol.status && symbol.status !== "real" && symbol.status !== "ok");
  const unavailableIndicators = fredEntries.filter(([, item]) => item.status && item.status !== "real" && item.status !== "ok");

  return (
    <>
      <ShellTitle title="Data Source Center" eyebrow="Local data control tower" source={source} />
      <p className="mb-6 max-w-4xl text-sm leading-6 text-slate-300">
        Macro-Watch reads local generated JSON first and falls back to committed mock JSON when generated output is missing or incomplete. Refresh is manual, read-only from the browser, and intended to keep research pages runnable without a backend.
      </p>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Data mode" value={<SourceBadge source={source} />} detail="generated-first, mock-fallback" />
        <MetricTile label="Last generated" value={pipelineStatus.generated_at ? formatDateTime(pipelineStatus.generated_at) : "N/A"} detail={freshness.label} />
        <MetricTile label="Asset coverage" value={`${coverage.assets?.real ?? 0}/${coverage.assets?.enabled ?? 0}`} detail={`${getEnabledAssetCatalog().length}/${getAssetCatalog().length} enabled/catalog`} />
        <MetricTile label="Indicator coverage" value={`${coverage.indicators?.real ?? 0}/${coverage.indicators?.enabled ?? 0}`} detail={`${getEnabledIndicatorCatalog().length} enabled raw/derived`} />
        <MetricTile label="Signal cards" value={signalCards.cards?.length ?? 0} detail="mechanical observations" />
        <MetricTile label="Evidence cards" value={evidenceCards.cards?.length ?? 0} detail="deterministic references" />
        <MetricTile label="Stress buckets" value={stressEngine.buckets?.length ?? 0} detail={`${stressEngine.confirmation?.pairs?.length ?? 0} confirmation pairs; bucket detail pages available`} />
        <MetricTile label="Warnings" value={warningCount(pipelineStatus, files)} detail="provider, output, and stress warnings" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Provider Status">
          <div className="grid gap-3 sm:grid-cols-2">
            {providers.map((provider, index) => (
              <div key={`${provider.name}-${index}`} className="rounded border border-line bg-ink p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-white">{provider.name ?? "Provider"}</p>
                  <StatusBadge label={provider.status} real={provider.status === "used" || provider.status === "available" || provider.status === "ok"} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{provider.note ?? "No note reported."}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Refresh Workflow">
          <p className="text-sm text-slate-300">Data does not update automatically. Run the local refresh command, then rebuild if you are serving a production build.</p>
          <pre className="mt-3 overflow-x-auto rounded bg-ink p-4 text-sm text-slate-300">{`npm run data:refresh
npm run build`}</pre>
          <p className="mt-3 text-sm text-slate-400">`npm run data:refresh` updates ignored local generated JSON. `npm run build` should be run after refresh for production serving. There is no browser button, API key manager, connector editor, or background refresh yet.</p>
        </Panel>

        <Panel title="Files / Outputs" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="py-2">Output</th><th>Status</th><th>Provider</th><th>Data</th><th>Count</th><th>Warnings</th></tr>
              </thead>
              <tbody>
                {outputFiles.map((name) => {
                  const file = files[name];
                  return (
                    <tr key={name} className="border-t border-line">
                      <td className="py-3 font-medium text-white">{name}</td>
                      <td className="text-slate-300">{file?.status ?? (name === "pipeline_status.json" && pipelineStatus.generated_at ? pipelineStatus.status ?? "ok" : "fallback")}</td>
                      <td className="text-slate-400">{file?.provider ?? (name === "pipeline_status.json" ? "local pipeline" : "N/A")}</td>
                      <td className={dataKind(file) === "real" ? "text-gain" : dataKind(file) === "generated" ? "text-cyan-300" : "text-warn"}>{dataKind(file)}</td>
                      <td className="text-slate-400">{outputCount(name, data)}</td>
                      <td className="text-slate-400">{file?.warnings?.length ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Coverage">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Assets by group</h3>
              <div className="space-y-2">
                {(coverage.assets?.groups?.length ? coverage.assets.groups : [{ group: "Unavailable", enabled: 0, real: 0, unavailable: 0, coverage: 0 }]).map((group) => (
                  <div key={group.group} className="rounded border border-line bg-ink p-3 text-sm">
                    <div className="flex items-center justify-between gap-3"><span className="font-medium text-white">{group.group}</span><span className="text-slate-400">{group.real ?? 0}/{group.enabled ?? 0}</span></div>
                    <p className="mt-1 text-xs text-slate-500">Unavailable {group.unavailable ?? 0} · coverage {Math.round((group.coverage ?? 0) * 100)}%</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Indicators by group</h3>
              <div className="space-y-2">
                {(coverage.indicators?.groups?.length ? coverage.indicators.groups : [{ group: "Unavailable", enabled: 0, real: 0, unavailable: 0, coverage: 0 }]).map((group) => (
                  <div key={group.group} className="rounded border border-line bg-ink p-3 text-sm">
                    <div className="flex items-center justify-between gap-3"><span className="font-medium text-white">{group.group}</span><span className="text-slate-400">{group.real ?? 0}/{group.enabled ?? 0}</span></div>
                    <p className="mt-1 text-xs text-slate-500">Unavailable {group.unavailable ?? 0} · coverage {Math.round((group.coverage ?? 0) * 100)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Warnings">
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Provider and pipeline warnings</h3>
              <ul className="space-y-2">
                {(warnings.length ? warnings : ["No warnings reported."]).map((warning) => <li className="rounded border border-amber-400/20 bg-amber-400/5 p-2 text-amber-100" key={warning}>{warning}</li>)}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-line bg-ink p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Unavailable assets</p>
                <p className="mt-2 text-slate-300">{unavailableAssets.length ? unavailableAssets.map((asset) => asset.symbol).join(", ") : "None reported"}</p>
              </div>
              <div className="rounded border border-line bg-ink p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Unavailable indicators</p>
                <p className="mt-2 text-slate-300">{unavailableIndicators.length ? unavailableIndicators.map(([series]) => series).join(", ") : "None reported"}</p>
              </div>
            </div>
          </div>
        </Panel>

        <details className="rounded-lg border border-line bg-panel p-4 shadow-xl shadow-black/20 xl:col-span-2">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-slate-300">Provider detail</summary>
          <div className="mt-3 grid gap-4 xl:grid-cols-2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="py-2">Symbol</th><th>Status</th><th>Provider</th><th>Data</th><th>History</th><th>Error</th></tr>
                </thead>
                <tbody>
                  {(pipelineStatus.symbols?.length ? pipelineStatus.symbols : [{ symbol: "N/A", status: "unavailable", provider: null, real_data: false, error: "Run the local pipeline." }]).map((symbol, index) => (
                    <tr key={`${symbol.symbol}-${index}`} className="border-t border-line">
                      <td className="py-3 font-medium text-white">{symbol.symbol ?? "N/A"}</td>
                      <td className="text-slate-300">{symbol.status ?? "unknown"}</td>
                      <td className="text-slate-400">{symbol.provider ?? "N/A"}</td>
                      <td className={symbol.real_data ? "text-gain" : "text-warn"}>{symbol.real_data ? "real" : "fallback"}</td>
                      <td className="text-slate-400">{symbol.history_status ?? "N/A"} · {symbol.history_rows ?? 0} rows</td>
                      <td className="text-slate-400">{symbol.error ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="py-2">Series</th><th>Status</th><th>Provider</th><th>Latest</th><th>Data</th></tr>
                </thead>
                <tbody>
                  {fredRows.map(([series, item]) => (
                    <tr key={series} className="border-t border-line">
                      <td className="py-3 font-medium text-white">{series}</td>
                      <td className="text-slate-300">{item.status ?? "unknown"}</td>
                      <td className="text-slate-400">{item.provider ?? "N/A"}</td>
                      <td className="text-slate-400">{item.latest_date ? formatDate(item.latest_date) : "N/A"}</td>
                      <td className={item.real_data ? "text-gain" : "text-warn"}>{item.real_data ? "real" : "fallback"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>
    </>
  );
}
