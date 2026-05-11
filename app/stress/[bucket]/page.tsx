import Link from "next/link";
import { notFound } from "next/navigation";
import { MetricTile, Panel, ShellTitle, StatusBadge } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";
import { evidenceHref } from "@/lib/evidenceRoutes";
import { formatDelta } from "@/lib/format";
import { STRESS_BUCKET_ORDER, stressBucketTitle } from "@/lib/stressRoutes";
import type { EvidenceCard, StressEngineBucket, StressEngineCounterEvidence, StressEngineDriver, StressEngineIndicator } from "@/lib/types";

type EvidenceLike = StressEngineDriver | StressEngineCounterEvidence | StressEngineIndicator;

export function generateStaticParams() {
  return STRESS_BUCKET_ORDER.map((bucket) => ({ bucket }));
}

export default async function StressBucketPage({ params }: { params: Promise<{ bucket: string }> }) {
  const { bucket: rawBucket } = await params;
  const bucketId = decodeURIComponent(rawBucket).toLowerCase();
  const { stressEngine, evidenceCards } = getCockpitData();
  const bucket = stressEngine.buckets?.find((item) => item.id?.toLowerCase() === bucketId || item.label?.toLowerCase() === bucketId);
  if (!bucket) {
    if (!STRESS_BUCKET_ORDER.includes(bucketId)) notFound();
    return <UnavailableBucket bucketId={bucketId} />;
  }

  const sourceIds = sourceIdSet(bucket);
  const relatedEvidence = (evidenceCards.cards ?? []).filter((card) => card.source_ids?.some((id) => sourceIds.has(id))).slice(0, 8);

  return (
    <>
      <ShellTitle title={`${bucket.label ?? stressBucketTitle(bucketId)} Stress`} eyebrow="Stress bucket detail" />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/stress" className="rounded border border-line px-3 py-2 text-slate-300 hover:bg-panel hover:text-white">Back to Stress</Link>
        <StatusBadge label={bucket.status} real={bucket.status === "real" || bucket.status === "ok" || bucket.status === "partial"} />
        <StatusBadge label={bucket.severity} />
        <span className="text-slate-400">Context-only diagnosis. Not a full score or trading signal.</span>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Severity" value={bucket.severity ?? "unknown"} detail={bucket.severity_note ?? "context percentile only"} />
        <MetricTile label="Momentum" value={bucket.momentum ?? "unknown"} detail={bucket.momentum_note ?? "directionality-aware where available"} />
        <MetricTile label="Confidence" value={bucket.confidence ?? "low"} detail={bucket.coverage_note ?? "coverage-aware"} />
        <MetricTile label="Context percentile" value={formatPctile(bucket.context_percentile)} detail="not a composite score" />
        <MetricTile label="Wired coverage" value={formatPct(bucket.wired_coverage)} detail="current wired candidates" />
        <MetricTile label="Candidate coverage" value={formatPct(bucket.candidate_coverage)} detail="against candidate universe" />
        <MetricTile label="Drivers" value={bucket.drivers?.length ?? 0} detail={`${bucket.counter_evidence?.length ?? 0} counter-evidence items`} />
        <MetricTile label="Watch items" value={bucket.watch_items?.length ?? 0} detail={`${bucket.indicators?.length ?? 0} bucket indicators`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <EvidenceList title="Drivers" items={bucket.drivers} emptyLabel="No mechanical drivers" emptyReason="No elevated or tightening signal cards found for this bucket." />
        <EvidenceList title="Counter-evidence" items={bucket.counter_evidence} emptyLabel="No counter-evidence listed" emptyReason="No low, easing, unavailable, or directionality-limited signal cards found." showStatus />
      </div>

      <Panel title="Watch items" className="mt-4">
        <div className="grid gap-3 md:grid-cols-3">
          {["info", "watch", "warning"].map((severity) => {
            const items = (bucket.watch_items ?? []).filter((item) => (item.severity ?? "info") === severity);
            return (
              <div key={severity} className="rounded border border-line bg-ink p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{severity}</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {(items.length ? items : [{ message: "No items in this group." }]).map((item, index) => (
                    <li key={`${item.message}-${index}`}>{item.message ?? "No watch item message."}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Indicators" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="py-2">Indicator</th><th>Source</th><th>Status</th><th>Data</th><th>Percentile</th><th>1M</th><th>3M</th><th>Trend</th><th>Acceleration</th><th>Directionality</th></tr>
            </thead>
            <tbody>
              {(bucket.indicators?.length ? bucket.indicators : [{ label: "No bucket indicators", status: "missing", real_data: false }]).map((indicator, index) => (
                <tr key={`${indicator.id ?? indicator.label}-${index}`} className="border-t border-line">
                  <td className="py-3 font-medium text-white">{indicator.href ? <Link href={indicator.href} className="hover:text-cyan-300">{indicator.label ?? indicator.id}</Link> : indicator.label ?? indicator.id ?? "Unavailable"}</td>
                  <td className="text-slate-400">{indicator.id ?? "N/A"}</td>
                  <td><StatusBadge label={indicator.status} real={indicator.status === "real"} /></td>
                  <td className={indicator.real_data ? "text-gain" : "text-warn"}>{indicator.real_data ? "real" : "fallback"}</td>
                  <td className="text-slate-300">{formatPctile(indicator.percentile_5y)}</td>
                  <td className="text-slate-300">{formatChange(indicator.rolling_change_1m)}</td>
                  <td className="text-slate-300">{formatChange(indicator.rolling_change_3m)}</td>
                  <td className="text-slate-400">{indicator.trend ?? "unknown"}</td>
                  <td className="text-slate-400">{indicator.acceleration ?? "unknown"}</td>
                  <td className="text-slate-400">{indicator.directionality ?? "unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Missing candidate indicators">
          <p className="text-sm text-slate-400">Future candidates for better coverage. These are not current failures.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(bucket.missing_candidate_indicators?.length ? bucket.missing_candidate_indicators : ["No missing candidates listed."]).map((item) => (
              <span key={item} className="rounded border border-line bg-ink px-3 py-2 text-sm text-slate-300">{item}</span>
            ))}
          </div>
          {bucket.interpretation_boundary ? <p className="mt-3 text-xs text-slate-500">{bucket.interpretation_boundary}</p> : null}
        </Panel>
        <RelatedEvidence cards={relatedEvidence} />
      </div>
    </>
  );
}

function UnavailableBucket({ bucketId }: { bucketId: string }) {
  return (
    <>
      <ShellTitle title={`${stressBucketTitle(bucketId)} Stress`} eyebrow="Stress bucket detail" />
      <Panel title="Bucket unavailable">
        <p className="text-sm text-slate-300">This bucket is known, but it is not present in the current Stress Engine output.</p>
        <p className="mt-2 text-sm text-slate-500">Run the local refresh workflow for generated context. This page remains context-only and does not add a composite score or trading signal.</p>
        <Link href="/stress" className="mt-4 inline-flex rounded border border-line px-3 py-2 text-sm text-slate-300 hover:bg-ink hover:text-white">Back to Stress</Link>
      </Panel>
    </>
  );
}

function EvidenceList({ title, items, emptyLabel, emptyReason, showStatus = false }: { title: string; items?: EvidenceLike[]; emptyLabel: string; emptyReason: string; showStatus?: boolean }) {
  const rows = items?.length ? items : [{ label: emptyLabel, reason: emptyReason }];
  return (
    <Panel title={title}>
      <div className="space-y-3">
        {rows.map((item, index) => (
          <LinkOrBox key={`${sourceId(item) ?? item.label}-${index}`} href={item.href}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{item.label ?? sourceId(item) ?? "Unavailable"}</p>
                <p className="mt-1 text-xs text-slate-500">{sourceId(item) ?? "No source id"}</p>
              </div>
              {showStatus || item.status ? <StatusBadge label={item.status} real={item.status === "real"} /> : null}
            </div>
            <p className="mt-2 text-sm text-slate-400">{reasonFor(item) ?? "Mechanical context only."}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>Percentile: {formatPctile(item.percentile_5y)}</span>
              {"rolling_change_1m" in item ? <span>1M: {formatChange(item.rolling_change_1m)}</span> : null}
            </div>
          </LinkOrBox>
        ))}
      </div>
    </Panel>
  );
}

function LinkOrBox({ href, children }: { href?: string; children: React.ReactNode }) {
  const className = "block rounded border border-line bg-ink p-3 text-sm transition hover:border-cyan-400/40";
  return href ? <Link href={href} className={className}>{children}</Link> : <div className={className}>{children}</div>;
}

function RelatedEvidence({ cards }: { cards: EvidenceCard[] }) {
  return (
    <Panel title="Related evidence">
      <div className="space-y-3">
        {(cards.length ? cards : [{ id: "none", title: "No related evidence", summary: "No existing evidence card matched this bucket source id." }]).map((card) => (
          <LinkOrBox key={card.id ?? card.title} href={card.id && card.id !== "none" ? evidenceHref(card.id) : undefined}>
            <p className="font-medium text-white">{card.title ?? card.id}</p>
            <p className="mt-1 text-sm text-slate-400">{card.summary ?? "Mechanical evidence reference."}</p>
            <p className="mt-2 text-xs text-slate-500">{card.source_ids?.join(", ") ?? "No source ids"}</p>
          </LinkOrBox>
        ))}
      </div>
    </Panel>
  );
}

function sourceIdSet(bucket: StressEngineBucket) {
  const ids = new Set<string>();
  for (const item of [...(bucket.drivers ?? []), ...(bucket.counter_evidence ?? []), ...(bucket.indicators ?? [])]) {
    const id = sourceId(item);
    if (id) ids.add(id);
  }
  return ids;
}

function sourceId(item: EvidenceLike) {
  if ("source_id" in item) return item.source_id;
  if ("id" in item) return item.id;
  return undefined;
}

function reasonFor(item: EvidenceLike) {
  return "reason" in item ? item.reason : undefined;
}

function formatPct(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "N/A";
}

function formatPctile(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value * 100)} pctile` : "N/A";
}

function formatChange(value: number | null | undefined) {
  return typeof value === "number" ? formatDelta(value, "") : "N/A";
}
