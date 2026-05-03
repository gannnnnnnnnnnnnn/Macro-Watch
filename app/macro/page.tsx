import { IndicatorList, Panel, ShellTitle } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

const groups = ["Rates", "Liquidity", "Inflation", "Credit", "Volatility", "Dollar", "Commodities"];

export default function MacroPage() {
  const { macro, source } = getCockpitData();
  return (
    <>
      <ShellTitle title="Macro" eyebrow="Indicator groups" source={source} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Panel title="OpenBB"><p className="text-sm text-slate-300">Market pipeline active; macro series not wired yet.</p></Panel>
        <Panel title="FRED later"><p className="text-sm text-slate-300">Planned source for rates, inflation, liquidity, and credit.</p></Panel>
        <Panel title="Generated JSON"><p className="text-sm text-slate-300">Current macro file is generated placeholder data.</p></Panel>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => <Panel key={group} title={group}><IndicatorList items={macro.groups?.[group]} /></Panel>)}
      </div>
    </>
  );
}
