import { IndicatorList, MetricTile, Panel, ShellTitle, StatusBadge } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";
import type { Indicator } from "@/lib/types";

const buckets = ["Volatility stress", "Credit stress", "Liquidity stress", "Banking stress", "Household stress", "Leverage stress", "Treasury market stress"];

function item(bucket: Indicator[] | undefined, name: string) {
  return bucket?.find((indicator) => indicator.name === name);
}

function value(indicator: Indicator | undefined) {
  if (!indicator) return "Unavailable";
  return `${indicator.value ?? "Unavailable"}${indicator.unit ? ` ${indicator.unit}` : ""}`;
}

export default function StressPage() {
  const { stress, source } = getCockpitData();
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
      <ShellTitle title="Stress radar" eyebrow="Partial real stress context" source={source} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <MetricTile label="Credit stress" value="partial" detail="HY OAS and Baa spread wired" badge={<StatusBadge label="partial" />} />
        <MetricTile label="Liquidity stress" value="partial" detail="Fed assets and RRP wired" badge={<StatusBadge label="partial" />} />
        <MetricTile label="Pending buckets" value="4" detail="Volatility, banking, household, leverage" badge={<StatusBadge label="pending" />} />
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="HY OAS" value={value(hyOas)} detail={hyOas?.latest_date ?? "No date"} />
        <MetricTile label="Baa spread" value={value(baa)} detail={baa?.latest_date ?? "No date"} />
        <MetricTile label="Fed assets" value={value(walcl)} detail={walcl?.latest_date ?? "No date"} />
        <MetricTile label="RRP" value={value(rrp)} detail={rrp?.latest_date ?? "No date"} />
        <MetricTile label="10Y" value={value(tenYear)} detail={tenYear?.latest_date ?? "No date"} />
        <MetricTile label="2Y" value={value(twoYear)} detail={twoYear?.latest_date ?? "No date"} />
        <MetricTile label="10Y-2Y" value={value(curve)} detail="Treasury context only" />
        <MetricTile label="Score" value="Not scored yet" detail="No fake stress score in v0" badge={<StatusBadge label="pending" />} />
      </div>
      <Panel title="Partial radar">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {buckets.map((bucket) => {
            const items = stress.buckets?.[bucket] ?? [];
            const real = items.some((indicator) => indicator.real_data);
            const pending = items.every((indicator) => indicator.status === "pending");
            return (
              <div key={bucket} className="rounded border border-line bg-ink p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{bucket}</p>
                  <StatusBadge label={real ? "partial" : pending ? "pending" : "unavailable"} real={real} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{real ? "Real series wired where shown below." : "Not wired yet."}</p>
              </div>
            );
          })}
        </div>
      </Panel>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {buckets.map((bucket) => <Panel key={bucket} title={bucket}><IndicatorList items={stress.buckets?.[bucket]} /></Panel>)}
      </div>
    </>
  );
}
