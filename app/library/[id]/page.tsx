import Link from "next/link";
import { notFound } from "next/navigation";
import { MetricTile, Panel, ShellTitle, StatusBadge } from "@/components/Cockpit";
import { getCockpitData, getEvidenceCards } from "@/lib/data";
import { evidenceHref, sourceHref } from "@/lib/evidenceRoutes";
import { formatDateTime, formatDelta, formatValueWithUnit } from "@/lib/format";
import type { EvidenceCard } from "@/lib/types";

export function generateStaticParams() {
  return (getEvidenceCards().cards ?? []).filter((card) => card.id).map((card) => ({ id: card.id }));
}

export default async function EvidenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const { evidenceCards, signalCards } = getCockpitData();
  const card = (evidenceCards.cards ?? []).find((item) => item.id === id);
  if (!card) notFound();

  const relatedSignals = (signalCards.cards ?? []).filter((signal) => signal.source_id && card.source_ids?.includes(signal.source_id)).slice(0, 8);

  return (
    <>
      <ShellTitle title={card.title ?? card.id ?? "Evidence"} eyebrow="Evidence detail" source={evidenceCards.source} />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/library" className="rounded border border-line px-3 py-2 text-slate-300 hover:bg-panel hover:text-white">Back to Evidence Library</Link>
        <StatusBadge label={card.type ?? "evidence"} />
        <StatusBadge label={card.module ?? "module"} />
        <StatusBadge label={card.status} real={card.status === "real" || card.status === "ok"} />
        <span className="text-slate-400">AI generated: {card.ai_generated ? "true" : "false"}</span>
      </div>

      <Panel title="Summary">
        <p className="text-sm text-slate-300">{card.summary ?? "Mechanical evidence reference."}</p>
        <p className="mt-3 text-xs text-cyan-200">Deterministic evidence card. No AI interpretation.</p>
        <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Meta label="Time range" value={card.time_range ?? "N/A"} />
          <Meta label="Created" value={formatDateTime(card.created_at)} />
          <Meta label="Updated" value={formatDateTime(card.updated_at)} />
          <Meta label="Boundary" value={card.interpretation_boundary ?? "No AI analysis or trading advice."} />
        </dl>
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.7fr_1fr]">
        <Panel title="Source IDs">
          <div className="flex flex-wrap gap-2">
            {(card.source_ids?.length ? card.source_ids : ["No source ids"]).map((sourceId) => (
              <Link key={sourceId} href={sourceHref(sourceId, sourceTypeFor(card))} className="rounded border border-line bg-ink px-3 py-2 text-sm text-cyan-200 hover:border-cyan-400/40">
                {sourceId}
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title="Evidence Links">
          <div className="flex flex-wrap gap-2">
            {(card.evidence?.length ? card.evidence : [{ label: "No external evidence links", kind: "reference" }]).map((item, index) => {
              const label = `${item.kind ?? "source"}: ${item.label ?? "N/A"}`;
              return item.href ? (
                <Link key={`${item.href}-${index}`} href={item.href} className="rounded border border-line bg-ink px-3 py-2 text-sm text-cyan-200 hover:border-cyan-400/40">{label}</Link>
              ) : (
                <span key={`${label}-${index}`} className="rounded border border-line bg-ink px-3 py-2 text-sm text-slate-400">{label}</span>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title="Tags" className="mt-4">
        <div className="flex flex-wrap gap-2">
          {(card.tags?.length ? card.tags : ["untagged"]).map((tag) => (
            <span key={tag} className="rounded border border-line bg-ink px-2.5 py-1 text-xs text-slate-300">{tag}</span>
          ))}
        </div>
      </Panel>

      <Panel title="Related signal cards" className="mt-4">
        <div className="grid gap-3 xl:grid-cols-2">
          {(relatedSignals.length ? relatedSignals : [{ id: "none", label: "No related signal card", bucket: "N/A" }]).map((signal) => (
            <div key={signal.id ?? signal.label} className="rounded border border-line bg-ink p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{signal.href ? <Link href={signal.href} className="hover:text-cyan-300">{signal.label ?? signal.source_id}</Link> : signal.label ?? signal.source_id}</p>
                  <p className="mt-1 text-xs text-slate-500">{signal.bucket ?? "No bucket"} · {signal.source_id ?? "No source id"}</p>
                </div>
                <StatusBadge label={signal.status} real={signal.real_data} />
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                <span>Latest: {formatValueWithUnit(signal.latest_value, signal.unit)}</span>
                <span>Percentile: {formatPctile(signal.transforms?.percentile_5y)}</span>
                <span>1M: {typeof signal.transforms?.rolling_change_1m === "number" ? formatDelta(signal.transforms.rolling_change_1m, signal.unit ?? "") : "N/A"}</span>
                <span>Trend: {signal.transforms?.trend ?? "unknown"}</span>
                <span>Acceleration: {String(signal.transforms?.acceleration ?? "unknown")}</span>
                {signal.href ? <Link href={signal.href} className="text-cyan-200 hover:text-cyan-100">Open source</Link> : <span>No source route</span>}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-ink p-3">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-300">{value}</dd>
    </div>
  );
}

function sourceTypeFor(card: EvidenceCard) {
  return card.source_ids?.length === 1 ? card.type : undefined;
}

function formatPctile(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value * 100)} pctile` : "N/A";
}
