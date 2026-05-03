import { Panel, ShellTitle, SourceBadge } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

export default function DataLabPage() {
  const { pipelineStatus, source } = getCockpitData();
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
