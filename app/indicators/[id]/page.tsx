import Link from "next/link";
import { LightweightChart } from "@/components/LightweightChart";
import { MetricTile, Panel, ShellTitle, SourceBadge, StatusBadge } from "@/components/Cockpit";
import { getCockpitData, getEnabledIndicatorCatalog, indicatorHistoryFor, resolveIndicator } from "@/lib/data";

export function generateStaticParams() {
  return getEnabledIndicatorCatalog().map((indicator) => ({ id: indicator.id }));
}

export default async function IndicatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const { macro, stress, indicatorHistory, pipelineStatus, source } = getCockpitData();
  const indicator = resolveIndicator(id, macro, stress);
  const rows = indicatorHistoryFor(indicator.id ?? id, indicatorHistory);

  return (
    <>
      <ShellTitle title={indicator.label ?? indicator.name ?? id} eyebrow="Indicator detail" source={source} />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/macro" className="rounded border border-line px-3 py-2 text-slate-300 hover:bg-panel hover:text-white">Back to Macro</Link>
        <SourceBadge source={source} />
        <StatusBadge label={indicator.status} real={indicator.real_data} />
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricTile label="Latest" value={<>{indicator.value ?? "Unavailable"}{indicator.unit ? <span className="ml-1 text-sm text-slate-500">{indicator.unit}</span> : null}</>} detail={indicator.latest_date ?? "Run pipeline"} />
        <MetricTile label="Provider" value={indicator.provider ?? "N/A"} detail={indicator.series_id ?? indicator.id ?? "Local JSON"} />
        <MetricTile label="Δ previous" value={indicator.delta_label ?? "Unavailable"} detail="context only" />
        <MetricTile label="1Y change" value={indicator.one_year_delta_label ?? "Unavailable"} detail="context only" />
        <MetricTile label="Score" value="Not scored" detail="No AI or regime scoring" badge={<StatusBadge label="pending" />} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.55fr]">
        <Panel title="Local indicator chart">
          <LightweightChart indicator={rows} height={380} />
        </Panel>
        <Panel title="Source note">
          <p className="text-sm text-slate-300">{indicator.note ?? "No note available."}</p>
          <div className="mt-4 rounded border border-line bg-ink p-3 text-sm text-slate-400">
            <p>Generated: {pipelineStatus.generated_at ?? "Unavailable"}</p>
            <p className="mt-1">History rows: {rows.length}</p>
          </div>
        </Panel>
      </div>
      <Panel title="Recent observations">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500"><tr><th className="py-2">Date</th><th>Value</th></tr></thead>
            <tbody>
              {(rows.length ? rows.slice(-16).reverse() : [{ date: "Unavailable", value: null }]).map((row, index) => (
                <tr key={`${row.date}-${index}`} className="border-t border-line">
                  <td className="py-3 font-medium text-white">{row.date ?? "N/A"}</td>
                  <td>{row.value ?? "N/A"}{indicator.unit ? ` ${indicator.unit}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
