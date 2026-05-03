import { Panel, ShellTitle, SourceBadge } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

export default function DataLabPage() {
  const { pipelineStatus, source } = getCockpitData();
  const fileEntries: [string, { status?: string; provider?: string | null; real_data?: boolean }][] =
    Object.entries(pipelineStatus.files ?? {});
  const fallbackFiles: [string, { status?: string; provider?: string | null; real_data?: boolean }][] = [
    ["No files", { status: "unavailable", real_data: false }],
  ];
  const files = fileEntries.length ? fileEntries : fallbackFiles;
  return (
    <>
      <ShellTitle title="Data Lab" eyebrow="Local pipeline" source={source} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Pipeline status">
          <div className="space-y-4">
            <div className="flex items-center justify-between"><span>Status</span><SourceBadge source={pipelineStatus.status ?? "unavailable"} /></div>
            <div className="flex items-center justify-between"><span>Last generated</span><span className="text-slate-300">{pipelineStatus.generated_at ?? "Unavailable"}</span></div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">Warnings</p>
              <ul className="space-y-2 text-sm text-slate-400">{(pipelineStatus.warnings?.length ? pipelineStatus.warnings : ["No warnings reported."]).map((warning) => <li key={warning}>{warning}</li>)}</ul>
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
        <Panel title="Generated files">
          <div className="space-y-3">
            {files.map(([name, file]) => (
              <div key={name} className="rounded border border-line bg-ink p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">{name}</p>
                  <span className="text-sm text-slate-300">{file.status ?? "unknown"} · {file.real_data ? "real" : "fallback"}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">Provider: {file.provider ?? "N/A"}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Market symbols">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="py-2">Symbol</th><th>Status</th><th>Provider</th><th>Data</th><th>Error</th></tr>
              </thead>
              <tbody>
                {(pipelineStatus.symbols?.length ? pipelineStatus.symbols : [{ symbol: "N/A", status: "unavailable", provider: null, real_data: false, error: "Run the local pipeline." }]).map((symbol, index) => (
                  <tr key={`${symbol.symbol}-${index}`} className="border-t border-line">
                    <td className="py-3 font-medium text-white">{symbol.symbol ?? "N/A"}</td>
                    <td className="text-slate-300">{symbol.status ?? "unknown"}</td>
                    <td className="text-slate-400">{symbol.provider ?? "N/A"}</td>
                    <td className={symbol.real_data ? "text-gain" : "text-warn"}>{symbol.real_data ? "real" : "fallback"}</td>
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
