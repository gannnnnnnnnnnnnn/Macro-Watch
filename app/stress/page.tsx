import Link from "next/link";
import { IndicatorList, MetricTile, Panel, ShellTitle, StatusBadge } from "@/components/Cockpit";
import { StressRadarClient } from "@/components/StressRadarClient";
import { getCockpitData, withIndicatorHrefs } from "@/lib/data";
import { formatDelta, formatValueWithUnit } from "@/lib/format";
import type { Indicator, StressEngineBucket } from "@/lib/types";

const buckets = ["Volatility stress", "Credit stress", "Liquidity stress", "Banking stress", "Household stress", "Leverage stress", "Treasury market stress"];

function item(bucket: Indicator[] | undefined, name: string) {
  return bucket?.find((indicator) => indicator.name === name);
}

function value(indicator: Indicator | undefined) {
  if (!indicator) return "Unavailable";
  return formatValueWithUnit(indicator.value, indicator.unit);
}

function detail(indicator: Indicator | undefined, fallback = "context only") {
  return typeof indicator?.delta === "number" ? `Last obs ${formatDelta(indicator.delta, indicator.unit ?? "")} · ${typeof indicator.one_year_delta === "number" ? `1Y ${formatDelta(indicator.one_year_delta, indicator.unit ?? "")}` : fallback}` : indicator?.latest_date ?? fallback;
}

function pct(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "N/A";
}

function bucketHref(bucket: StressEngineBucket) {
  return `#bucket-${bucket.id ?? bucket.label ?? "stress"}`;
}

export default function StressPage() {
  const { stress, indicatorHistory, marketHistory, stressEngine, evidenceCards } = getCockpitData();
  const credit = stress.buckets?.["Credit stress"];
  const liquidity = stress.buckets?.["Liquidity stress"];
  const treasury = stress.buckets?.["Treasury market stress"];
  const hyOas = item(credit, "High yield OAS");
  const baa = item(credit, "Baa spread vs 10Y");
  const walcl = item(liquidity, "Fed total assets");
  const rrp = item(liquidity, "Overnight reverse repos");
  const tenYear = item(treasury, "10Y Treasury yield");
  const twoYear = item(treasury, "2Y Treasury yield");
  const curve = item(treasury, "10Y-2Y spread");

  return (
    <>
      <ShellTitle title="Stress radar" eyebrow="Partial real stress context" />
      <p className="mb-4 max-w-3xl text-sm text-slate-400">
        Context percentile only. Partial coverage. Not a full stress score. Stress Engine v1 is a transparent diagnosis layer built from local signal cards.
      </p>
      <StressRadarClient stress={stress} indicatorHistory={indicatorHistory} marketHistory={marketHistory} stressEngine={stressEngine} />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricTile label="Buckets" value={stressEngine.buckets?.length ?? 0} detail="coverage-aware diagnosis buckets" badge={<StatusBadge label={stressEngine.status ?? "partial"} />} />
        <MetricTile label="Drivers" value={(stressEngine.buckets ?? []).reduce((sum, bucket) => sum + (bucket.drivers?.length ?? 0), 0)} detail="mechanical supporting evidence" />
        <MetricTile label="Composite" value={stressEngine.composite?.available ? "available" : "disabled"} detail={stressEngine.composite?.reason ?? "Composite unavailable by design"} badge={<StatusBadge label={stressEngine.composite?.available ? "available" : "disabled"} />} />
      </div>
      <Panel title="Bucket diagnosis" className="mt-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(stressEngine.buckets ?? []).map((bucket) => (
            <a key={bucket.id ?? bucket.label} href={bucketHref(bucket)} className="rounded border border-line bg-ink p-3 transition hover:border-cyan-400/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{bucket.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{pct(bucket.context_percentile)} context percentile</p>
                </div>
                <StatusBadge label={bucket.severity ?? bucket.status} real={bucket.status !== "pending"} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <span>Momentum: {bucket.momentum ?? "unknown"}</span>
                <span>Confidence: {bucket.confidence ?? "low"}</span>
                <span>Wired: {pct(bucket.wired_coverage)}</span>
                <span>Candidate: {pct(bucket.candidate_coverage)}</span>
                <span>Drivers: {bucket.drivers?.length ?? 0}</span>
                <span>Counter: {bucket.counter_evidence?.length ?? 0}</span>
              </div>
            </a>
          ))}
        </div>
      </Panel>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="HY OAS" value={value(hyOas)} detail={detail(hyOas)} />
        <MetricTile label="Baa spread" value={value(baa)} detail={detail(baa)} />
        <MetricTile label="Fed assets" value={value(walcl)} detail={detail(walcl)} />
        <MetricTile label="RRP" value={value(rrp)} detail={detail(rrp)} />
        <MetricTile label="10Y" value={value(tenYear)} detail={detail(tenYear)} />
        <MetricTile label="2Y" value={value(twoYear)} detail={detail(twoYear)} />
        <MetricTile label="10Y-2Y" value={value(curve)} detail={detail(curve, "Treasury context only")} />
        <MetricTile label="Coverage" value="Partial" detail="No full stress score" badge={<StatusBadge label="partial" />} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {(stressEngine.buckets ?? []).map((bucket) => (
          <Panel key={bucket.id ?? bucket.label} title={`${bucket.label ?? "Bucket"} diagnosis`}>
            <div id={`bucket-${bucket.id ?? bucket.label}`} className="grid gap-3 sm:grid-cols-3">
              <MetricTile label="Severity" value={bucket.severity ?? "unknown"} detail={bucket.severity_note ?? "context only"} />
              <MetricTile label="Momentum" value={bucket.momentum ?? "unknown"} detail={bucket.momentum_note ?? "directionality-aware where available"} />
              <MetricTile label="Confidence" value={bucket.confidence ?? "low"} detail={bucket.coverage_note ?? "coverage-aware"} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Drivers</h3>
                <div className="mt-2 space-y-2">
                  {(bucket.drivers?.length ? bucket.drivers : [{ label: "No mechanical drivers", reason: "No elevated or tightening signal cards found." }]).map((driver, index) => (
                    <Link key={`${driver.source_id ?? driver.label}-${index}`} href={driver.href ?? "/library"} className="block rounded border border-line bg-ink p-3 text-sm hover:border-cyan-400/40">
                      <span className="font-medium text-white">{driver.label ?? driver.source_id}</span>
                      <span className="mt-1 block text-xs text-slate-500">{driver.reason ?? "Mechanical context only."}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Counter-evidence</h3>
                <div className="mt-2 space-y-2">
                  {(bucket.counter_evidence?.length ? bucket.counter_evidence : [{ label: "No counter-evidence listed", reason: "No low, easing, unavailable, or directionality-limited signal cards found." }]).map((item, index) => (
                    <Link key={`${item.source_id ?? item.label}-${index}`} href={item.href ?? "/library"} className="block rounded border border-line bg-ink p-3 text-sm hover:border-cyan-400/40">
                      <span className="font-medium text-white">{item.label ?? item.source_id}</span>
                      <span className="mt-1 block text-xs text-slate-500">{item.reason ?? "Mechanical context only."}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Watch items</h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {(bucket.watch_items?.length ? bucket.watch_items : [{ message: "No bucket watch items.", severity: "info" }]).map((item, index) => (
                    <li key={`${item.message}-${index}`} className="rounded border border-line bg-ink p-2">{item.severity ?? "info"} · {item.message}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Missing candidates</h3>
                <p className="mt-2 text-sm text-slate-400">{bucket.missing_candidate_indicators?.length ? bucket.missing_candidate_indicators.join(", ") : "No missing candidates listed."}</p>
                <p className="mt-2 text-xs text-slate-500">{bucket.interpretation_boundary}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
      <Panel title="Confirmation matrix" className="mt-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {(stressEngine.confirmation?.pairs ?? []).map((pair) => (
            <div key={pair.id ?? pair.label} className="rounded border border-line bg-ink p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-white">{pair.label}</p>
                <StatusBadge label={pair.status} real={pair.status === "confirmed"} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{pair.summary}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Confirmation pairs are relationship checks only. They are not a composite score.</p>
      </Panel>
      <details className="mt-4 rounded-lg border border-line bg-panel p-4 shadow-xl shadow-black/20">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-slate-300">All stress buckets</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {buckets.map((bucket) => <Panel key={bucket} title={bucket}><IndicatorList items={withIndicatorHrefs(stress.buckets?.[bucket])} /></Panel>)}
        </div>
      </details>
      <details className="mt-4 rounded-lg border border-line bg-panel p-4 shadow-xl shadow-black/20">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-slate-300">Evidence links</summary>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(evidenceCards.cards ?? []).filter((card) => ["volatility", "credit", "liquidity", "treasury", "banking", "household", "leverage", "rates"].includes(card.module ?? "")).slice(0, 12).map((card) => (
            <a key={card.id} href={card.evidence?.[0]?.href ?? "/library"} className="rounded border border-line bg-ink p-3 text-sm text-slate-300 hover:border-cyan-400/40 hover:text-white">
              <span className="block font-medium text-white">{card.title ?? card.id}</span>
              <span className="mt-1 block text-xs text-slate-500">{card.summary ?? "Mechanical evidence reference."}</span>
            </a>
          ))}
        </div>
      </details>
    </>
  );
}
