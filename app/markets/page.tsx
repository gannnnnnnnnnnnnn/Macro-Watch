import { ShellTitle } from "@/components/Cockpit";
import { MarketsClient } from "@/components/MarketsClient";
import { getCockpitData, getPinCatalog } from "@/lib/data";

export default function MarketsPage() {
  const { market, marketHistory } = getCockpitData();
  const assets = market.assets ?? [];
  return (
    <>
      <ShellTitle title="Markets" eyebrow="Interactive asset explorer" />
      <MarketsClient assets={assets} history={marketHistory} defaultPins={getPinCatalog()} />
    </>
  );
}
