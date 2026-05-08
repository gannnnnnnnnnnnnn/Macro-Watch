import { IndicatorList, MetricTile, Panel, ShellTitle, StatusBadge } from "@/components/Cockpit";
import { StressRadarClient } from "@/components/StressRadarClient";
import { getCockpitData, withIndicatorHrefs } from "@/lib/data";
import { formatDelta, formatValueWithUnit } from "@/lib/format";
import type { Indicator } from "@/lib/types";

const buckets = ["Volatility stress", "Credit stress", "Liquidity stress", "Banking stress", "Household stress", "Leverage stress", "Treasury market stress"];

function item(bucket: Indicator[] | undefined, name: string) {
  return bucket?.find((indicator) => indicator.name === name);
}

function value(indicator: Indicator | undefined) {
  if (!indicator) return "Unavailable";
  return formatValueWithUnit(indicator.value, indicator.unit);
}

function detail(indicator: Indicator | undefined, fallback = "context only") {
  return typeof indicator?.delta === "number" ? `Δ previous ${formatDelta(indicator.delta, indicator.unit ?? "")} · ${typeof indicator.one_year_delta === "number" ? `1Y change ${formatDelta(indicator.one_year_delta, indicator.unit ?? "")}` : fallback}` : indicator?.latest_date ?? fallback;
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
        Context percentile only. Partial coverage. Not a full stress score. Some directionality remains provisional, and AI/advanced stress engine work comes later.
      </p>
      <StressRadarClient stress={stress} indicatorHistory={indicatorHistory} marketHistory={marketHistory} />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricTile label="Credit context" value="partial" detail="HY OAS and Baa spread wired" badge={<StatusBadge label="partial" />} />
        <MetricTile label="Liquidity context" value="partial" detail="Fed assets and RRP wired" badge={<StatusBadge label="partial" />} />
        <MetricTile label="Stress engine" value={stressEngine.buckets?.length ?? 0} detail={stressEngine.composite?.reason ?? "Composite unavailable by design"} badge={<StatusBadge label={stressEngine.status ?? "skeleton"} />} />
      </div>
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
