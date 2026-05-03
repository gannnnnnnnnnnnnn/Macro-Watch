import { MetricTile, Panel, ShellTitle, SourceBadge, StatusBadge } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

export default function DataLabPage() {
  const { pipelineStatus, source, marketHistory } = getCockpitData();
  const fileEntries: [string, { status?: string; provider?: string | null; real_data?: boolean; warnings?: string[] }][] =
    Object.entries(pipelineStatus.files ?? {});
  const fredEntries: [string, { status?: string; provider?: string | null; latest_date?: string | null; real_data?: boolean }][] =
    Object.entries(pipelineStatus.fred_series ?? {});
  const files = fileEntries.length ? fileEntries : [["No files", { status: "unavailable", real_data: false, warnings: [] }]] as [string, { status?: string; provider?: string | null; real_data?: boolean; warnings?: string[] }][];

  return (
    <>
      <ShellTitle title="Data Lab" eyebrow="Local data operations" source={source} />
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <MetricTile label="Frontend source" value={<SourceBadge source={source} />} detail="generated first, mock fallback" />
        <MetricTile label="Pipeline status" value={<StatusBadge label={pipelineStatus.status} />} detail={pipelineStatus.generated_at ?? "Unavailable"} />
        <MetricTile label="Market history" value={Object.keys(marketHistory.symbols ?? {}).length} detail="symbols with history file entries" />
        <MetricTile label="FRED series" value={fredEntries.filter(([, item]) => item.real_data).length} detail="real series currently loaded" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Generated files">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="py-2">File</th><th>Status</th><th>Provider</th><th>Data</th><th>Warnings</th></tr>
              </thead>
              <tbody>
                {files.map(([name, file]) => (
                  <tr key={name} className="border-t border-line">
                    <td className="py-3 font-medium text-white">{name}</td>
                    <td className="text-slate-300">{file.status ?? "unknown"}</td>
                    <td className="text-slate-400">{file.provider ?? "N/A"}</td>
                    <td className={file.real_data ? "text-gain" : "text-warn"}>{file.real_data ? "real" : "fallback"}</td>
                    <td className="text-slate-400">{file.warnings?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Providers">
          <div className="space-y-3">
            {(pipelineStatus.providers?.length ? pipelineStatus.providers : [{ name: "OpenBB", status: "unavailable", note: "Run the local pipeline." }]).map((provider, index) => (
              <div key={`${provider.name}-${index}`} className="rounded border border-line bg-ink p-3">
                <div className="flex items-center justify-between gap-3"><p className="font-medium text-white">{provider.name ?? "Provider"}</p><StatusBadge label={provider.status} real={provider.status === "used" || provider.status === "available"} /></div>
                <p className="mt-1 text-sm text-slate-400">{provider.note ?? "No note available"}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Market symbols">
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
        </Panel>
        <Panel title="FRED series">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="py-2">Series</th><th>Status</th><th>Provider</th><th>Latest</th><th>Data</th></tr>
              </thead>
              <tbody>
                {(fredEntries.length ? fredEntries : [["N/A", { status: "unavailable", provider: "FRED", latest_date: null, real_data: false }]] as [string, { status?: string; provider?: string | null; latest_date?: string | null; real_data?: boolean }][]).map(([series, item]) => (
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
        <Panel title="Warnings">
          <ul className="space-y-2 text-sm">
            {(pipelineStatus.warnings?.length ? pipelineStatus.warnings : ["No warnings reported."]).map((warning) => <li className="rounded border border-amber-400/20 bg-amber-400/5 p-2 text-amber-100" key={warning}>{warning}</li>)}
          </ul>
        </Panel>
        <Panel title="Local run commands">
          <pre className="overflow-x-auto rounded bg-ink p-4 text-sm text-slate-300">{`cd scripts/openbb_pipeline
source .venv/bin/activate
pip install -r requirements.txt
python run_all.py`}</pre>
          <p className="mt-3 text-sm text-slate-400">Contract: frontend reads `data/generated/*.json` first, then falls back to `data/mock/*.json` when generated files are missing or incomplete.</p>
        </Panel>
      </div>
    </>
  );
}
