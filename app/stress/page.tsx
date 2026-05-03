import { IndicatorList, Panel, ShellTitle } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

const buckets = ["Volatility stress", "Credit stress", "Liquidity stress", "Banking stress", "Household stress", "Leverage stress", "Treasury market stress"];

export default function StressPage() {
  const { stress, source } = getCockpitData();
  return (
    <>
      <ShellTitle title="Stress radar" eyebrow="Financial stress buckets" source={source} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {buckets.map((bucket) => <Panel key={bucket} title={bucket}><IndicatorList items={stress.buckets?.[bucket]} /></Panel>)}
      </div>
    </>
  );
}
