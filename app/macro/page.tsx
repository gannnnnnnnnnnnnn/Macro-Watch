import { IndicatorList, Panel, ShellTitle } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

const groups = ["Rates", "Liquidity", "Inflation", "Credit", "Volatility", "Dollar", "Commodities"];

export default function MacroPage() {
  const { macro, source } = getCockpitData();
  return (
    <>
      <ShellTitle title="Macro" eyebrow="Indicator groups" source={source} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => <Panel key={group} title={group}><IndicatorList items={macro.groups?.[group]} /></Panel>)}
      </div>
    </>
  );
}
