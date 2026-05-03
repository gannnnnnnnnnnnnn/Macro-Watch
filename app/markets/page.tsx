import { ShellTitle } from "@/components/Cockpit";
import { MarketsClient } from "@/components/MarketsClient";
import { getCockpitData } from "@/lib/data";

export default function MarketsPage() {
  const { market, marketHistory, source } = getCockpitData();
  const assets = market.assets ?? [];
  return (
    <>
      <ShellTitle title="Markets" eyebrow="Generated market data" source={source} />
      <MarketsClient assets={assets} history={marketHistory} />
    </>
  );
}
