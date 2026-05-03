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
  return typeof indicator?.delta === "number" ? `Δ previous ${formatDelta(indicator.delta, indicator.unit ?? "")} · ${indicator.one_year_delta_label ?? fallback}` : indicator?.latest_date ?? fallback;
}

export default function StressPage() {
  const { stress, indicatorHistory, marketHistory } = getCockpitData();
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
      <StressRadarClient stress={stress} indicatorHistory={indicatorHistory} marketHistory={marketHistory} />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricTile label="Credit context" value="partial" detail="HY OAS and Baa spread wired" badge={<StatusBadge label="partial" />} />
        <MetricTile label="Liquidity context" value="partial" detail="Fed assets and RRP wired" badge={<StatusBadge label="partial" />} />
        <MetricTile label="Pending buckets" value="3" detail="Banking, household, leverage" badge={<StatusBadge label="pending" />} />
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
    </>
  );
}
