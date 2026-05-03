import { IndicatorList, Panel, ShellTitle } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

const groups = ["Rates", "Inflation", "Labor", "Liquidity", "Credit", "Dollar", "Commodities"];

export default function MacroPage() {
  const { macro, source } = getCockpitData();
  return (
    <>
      <ShellTitle title="Macro" eyebrow="Indicator groups" source={source} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Panel title="FRED"><p className="text-sm text-slate-300">Rates, inflation, labor, liquidity, and credit are wired where FRED responds without keys.</p></Panel>
        <Panel title="OpenBB"><p className="text-sm text-slate-300">Market proxies remain OpenBB/yfinance; macro now uses generated FRED JSON.</p></Panel>
        <Panel title="Pending"><p className="text-sm text-slate-300">Dollar and commodity macro series still use market proxy context, not direct macro series.</p></Panel>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => <Panel key={group} title={group}><IndicatorList items={macro.groups?.[group]} /></Panel>)}
      </div>
    </>
  );
}
