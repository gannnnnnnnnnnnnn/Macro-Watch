import { IndicatorList, MetricTile, Panel, ShellTitle } from "@/components/Cockpit";
import { getCockpitData, withIndicatorHrefs } from "@/lib/data";
import { formatDelta, formatValueWithUnit } from "@/lib/format";
import type { Indicator } from "@/lib/types";

const groups = ["Rates", "Inflation", "Labor", "Liquidity", "Credit", "Growth", "Housing", "Dollar", "Commodities"];

function findIndicator(groupsMap: Record<string, Indicator[]> | undefined, name: string) {
  return Object.values(groupsMap ?? {}).flat().find((item) => item.name === name);
}

function value(item: Indicator | undefined) {
  if (!item) return "Unavailable";
  return formatValueWithUnit(item.value, item.unit);
}

function detail(item: Indicator | undefined, fallback = "context only") {
  return typeof item?.delta === "number" ? `Δ previous ${formatDelta(item.delta, item.unit ?? "")} · ${item.one_year_delta_label ?? fallback}` : item?.latest_date ?? fallback;
}

export default function MacroPage() {
  const { macro } = getCockpitData();
  const tenYear = findIndicator(macro.groups, "10Y Treasury yield");
  const twoYear = findIndicator(macro.groups, "2Y Treasury yield");
  const curve = findIndicator(macro.groups, "10Y-2Y spread");
  const fedFunds = findIndicator(macro.groups, "Effective fed funds");
  const cpi = findIndicator(macro.groups, "CPI YoY");
  const unemployment = findIndicator(macro.groups, "Unemployment rate");

  return (
    <>
      <ShellTitle title="Macro" eyebrow="Macro indicators" />
      <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricTile label="10Y yield" value={value(tenYear)} detail={detail(tenYear)} />
        <MetricTile label="2Y yield" value={value(twoYear)} detail={detail(twoYear)} />
        <MetricTile label="10Y-2Y" value={value(curve)} detail={detail(curve, "Curve spread, not a score")} />
        <MetricTile label="Fed funds" value={value(fedFunds)} detail={detail(fedFunds)} />
        <MetricTile label="CPI YoY" value={value(cpi)} detail={detail(cpi)} />
        <MetricTile label="Unemployment" value={value(unemployment)} detail={detail(unemployment)} />
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Panel title="FRED"><p className="text-sm text-slate-300">Rates, inflation, labor, liquidity, and credit are wired through FRED when available.</p></Panel>
        <Panel title="Generated JSON"><p className="text-sm text-slate-300">The frontend reads generated macro JSON first and keeps mock fallback available.</p></Panel>
        <Panel title="Pending"><p className="text-sm text-slate-300">Dollar and commodity macro series remain pending; market proxies cover them elsewhere.</p></Panel>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => <Panel key={group} title={group}><IndicatorList items={withIndicatorHrefs(macro.groups?.[group])} /></Panel>)}
      </div>
    </>
  );
}
