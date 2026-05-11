import Link from "next/link";
import { AddToWorkspaceButton } from "@/components/AddToWorkspaceButton";
import { LightweightChart } from "@/components/LightweightChart";
import { MetricTile, Panel, ShellTitle, StatusBadge } from "@/components/Cockpit";
import { PinButton } from "@/components/PinsClient";
import { getCockpitData, getEnabledIndicatorCatalog, getPinCatalog, indicatorHistoryFor, resolveIndicator } from "@/lib/data";
import { evidenceHref } from "@/lib/evidenceRoutes";
import { formatDate, formatDateTime, formatDelta, formatValueWithUnit } from "@/lib/format";

export function generateStaticParams() {
  return getEnabledIndicatorCatalog().map((indicator) => ({ id: indicator.id }));
}

export default async function IndicatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const { macro, stress, indicatorHistory, pipelineStatus, evidenceCards } = getCockpitData();
  const indicator = resolveIndicator(id, macro, stress);
  const defaultPins = getPinCatalog();
  const rows = indicatorHistoryFor(indicator.id ?? id, indicatorHistory);
  const relatedEvidence = (evidenceCards.cards ?? []).filter((card) => indicator.id && card.source_ids?.includes(indicator.id)).slice(0, 5);

  return (
    <>
      <ShellTitle title={indicator.label ?? indicator.name ?? id} eyebrow="Indicator detail" />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/macro" className="rounded border border-line px-3 py-2 text-slate-300 hover:bg-panel hover:text-white">Back to Macro</Link>
        <StatusBadge label={indicator.status} real={indicator.real_data} />
        {indicator.id ? <PinButton target={{ type: "indicator", id: indicator.id }} defaultPins={defaultPins} /> : null}
        {indicator.id ? <AddToWorkspaceButton type="indicator" id={indicator.id} label={indicator.label ?? indicator.id} /> : null}
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Latest" value={formatValueWithUnit(indicator.value, indicator.unit)} detail={indicator.latest_date ? formatDate(indicator.latest_date) : "Run pipeline"} />
        <MetricTile label="Last obs" value={typeof indicator.delta === "number" ? formatDelta(indicator.delta, indicator.unit ?? "") : indicator.delta_label ?? "Unavailable"} detail="context only" />
        <MetricTile label="1Y" value={indicator.one_year_delta_label ?? "Unavailable"} detail="context only" />
        <MetricTile label="Series" value={indicator.series_id ?? indicator.id ?? "Local JSON"} detail={indicator.provider ?? "Generated JSON"} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.55fr]">
        <Panel title="Local indicator chart">
          <LightweightChart indicator={rows} height={420} unit={indicator.unit} defaultRange="5Y" />
        </Panel>
        <Panel title="Source note">
          <p className="text-sm text-slate-300">{indicator.note ?? "No note available."}</p>
          <div className="mt-4 rounded border border-line bg-ink p-3 text-sm text-slate-400">
            <p>Updated: {formatDateTime(pipelineStatus.generated_at)}</p>
            <p className="mt-1">History rows: {rows.length}</p>
            <p className="mt-1 text-xs text-slate-500">Context only; no regime score or trading advice.</p>
          </div>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.55fr]">
        <Panel title="Recent observations">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500"><tr><th className="py-2">Date</th><th>Value</th></tr></thead>
              <tbody>
                {(rows.length ? rows.slice(-16).reverse() : [{ date: "Unavailable", value: null }]).map((row, index) => (
                  <tr key={`${row.date}-${index}`} className="border-t border-line">
                    <td className="py-3 font-medium text-white">{row.date ? formatDate(row.date) : "N/A"}</td>
                    <td>{formatValueWithUnit(row.value, indicator.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <RelatedEvidence cards={relatedEvidence} />
      </div>
    </>
  );
}

function RelatedEvidence({ cards }: { cards: { id?: string; title?: string; summary?: string; source_ids?: string[] }[] }) {
  return (
    <Panel title="Related evidence">
      <div className="space-y-3">
        {(cards.length ? cards : [{ id: "none", title: "No related evidence", summary: "No evidence card matched this indicator source id." }]).map((card) => (
          card.id && card.id !== "none" ? (
            <Link key={card.id} href={evidenceHref(card.id)} className="block rounded border border-line bg-ink p-3 hover:border-cyan-400/40">
              <p className="font-medium text-white">{card.title ?? card.id}</p>
              <p className="mt-1 text-sm text-slate-400">{card.summary ?? "Mechanical evidence reference."}</p>
              <p className="mt-2 text-xs text-slate-500">{card.source_ids?.join(", ") ?? "No source ids"}</p>
            </Link>
          ) : (
            <div key={card.id ?? card.title} className="rounded border border-line bg-ink p-3">
              <p className="font-medium text-white">{card.title}</p>
              <p className="mt-1 text-sm text-slate-400">{card.summary}</p>
            </div>
          )
        ))}
      </div>
    </Panel>
  );
}
