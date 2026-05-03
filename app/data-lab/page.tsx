import { Panel, ShellTitle, SourceBadge, StatusBadge } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

export default function DataLabPage() {
  const { pipelineStatus, source, marketHistory } = getCockpitData();
  const fileEntries: [string, { status?: string; provider?: string | null; real_data?: boolean }][] =
    Object.entries(pipelineStatus.files ?? {});
  const fredEntries: [string, { status?: string; provider?: string | null; latest_date?: string | null; real_data?: boolean }][] =
    Object.entries(pipelineStatus.fred_series ?? {});
  const fallbackFredEntries: [string, { status?: string; provider?: string | null; latest_date?: string | null; real_data?: boolean }][] = [
    ["N/A", { status: "unavailable", provider: "FRED", latest_date: null, real_data: false }],
  ];
  const fredRows = fredEntries.length ? fredEntries : fallbackFredEntries;
  const fallbackFiles: [string, { status?: string; provider?: string | null; real_data?: boolean }][] = [
    ["No files", { status: "unavailable", real_data: false }],
  ];
  const files = fileEntries.length ? fileEntries : fallbackFiles;
  return (
    <>
      <ShellTitle title="Data Lab" eyebrow="Local pipeline" source={source} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Panel title="Frontend source"><SourceBadge source={source} /></Panel>
        <Panel title="Market history"><StatusBadge label={marketHistory.status} real={marketHistory.real_data} /><p className="mt-2 text-sm text-slate-400">{Object.keys(marketHistory.symbols ?? {}).length} symbols loaded</p></Panel>
        <Panel title="Generated timestamp"><p className="text-sm text-slate-300">{pipelineStatus.generated_at ?? "Unavailable"}</p></Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Pipeline status">
          <div className="space-y-4">
            <div className="flex items-center justify-between"><span>Status</span><SourceBadge source={pipelineStatus.status ?? "unavailable"} /></div>
            <div className="flex items-center justify-between"><span>Last generated</span><span className="text-slate-300">{pipelineStatus.generated_at ?? "Unavailable"}</span></div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">Warnings</p>
              <ul className="space-y-2 text-sm">{(pipelineStatus.warnings?.length ? pipelineStatus.warnings : ["No warnings reported."]).map((warning) => <li className="rounded border border-amber-400/20 bg-amber-400/5 p-2 text-amber-100" key={warning}>{warning}</li>)}</ul>
            </div>
          </div>
        </Panel>
        <Panel title="Provider/source status">
          <div className="space-y-3">
            {(pipelineStatus.providers?.length ? pipelineStatus.providers : [{ name: "OpenBB", status: "unavailable", note: "Run the local pipeline." }]).map((provider, index) => (
              <div key={`${provider.name}-${index}`} className="rounded border border-line bg-ink p-3">
                <div className="flex items-center justify-between gap-3"><p className="font-medium text-white">{provider.name ?? "Provider"}</p><span className="text-sm text-slate-300">{provider.status ?? "unknown"}</span></div>
                <p className="mt-1 text-sm text-slate-400">{provider.note ?? "No note available"}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="FRED series">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="py-2">Series</th><th>Status</th><th>Provider</th><th>Latest</th><th>Data</th></tr>
              </thead>
              <tbody>
                {fredRows.map(([series, item]) => (
                  <tr key={series} className="border-t border-line">
                    <td className="py-3 font-medium text-white">{series}</td>
                    <td className="text-slate-300">{item.status ?? "unknown"}</td>
                    <td className="text-slate-400">{item.provider ?? "N/A"}</td>
                    <td className="text-slate-400">{item.latest_date ?? "N/A"}</td>
                    <td className={item.real_data ? "text-gain" : "text-warn"}>{item.real_data ? "real" : "fallback"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Generated files">
          <div className="space-y-3">
            {files.map(([name, file]) => (
              <div key={name} className="rounded border border-line bg-ink p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">{name}</p>
                  <span className="text-sm text-slate-300">{file.status ?? "unknown"} · {file.real_data ? "real" : "fallback"}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">Provider: {file.provider ?? "N/A"}{name === "market_history.json" ? ` · ${Object.keys(marketHistory.symbols ?? {}).length} symbols` : ""}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Market symbols">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
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
        </Panel>
        <Panel title="Run local pipeline">
          <pre className="overflow-x-auto rounded bg-ink p-4 text-sm text-slate-300">{`cd scripts/openbb_pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run_all.py`}</pre>
        </Panel>
      </div>
    </>
  );
}
