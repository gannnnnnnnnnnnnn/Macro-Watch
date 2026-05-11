import { ResearchWorkspaceClient } from "@/components/ResearchWorkspaceClient";
import { ShellTitle } from "@/components/Cockpit";
import { getCockpitData, getEnabledAssetCatalog, getEnabledIndicatorCatalog, resolveAsset, resolveIndicator } from "@/lib/data";
import { STRESS_BUCKET_ORDER, stressBucketTitle } from "@/lib/stressRoutes";

export default function WorkspacePage() {
  const { market, macro, stress, stressEngine, evidenceCards, source } = getCockpitData();
  const assets = getEnabledAssetCatalog().map((item) => resolveAsset(item.symbol, market));
  const indicators = getEnabledIndicatorCatalog().map((item) => resolveIndicator(item.id, macro, stress));
  const stressBuckets = STRESS_BUCKET_ORDER.map((id) => {
    const bucket = stressEngine.buckets?.find((item) => item.id?.toLowerCase() === id);
    return bucket ?? { id, label: stressBucketTitle(id), status: "unavailable", severity: "unknown", momentum: "unknown", confidence: "low" };
  });

  return (
    <>
      <ShellTitle title="Research Workspace" eyebrow="Local research workspace" source={source} />
      <p className="mb-4 max-w-3xl text-sm text-slate-400">
        Gather assets, indicators, stress buckets, and deterministic evidence cards into one local view. Workspace state is stored in this browser only.
      </p>
      <ResearchWorkspaceClient assets={assets} indicators={indicators} stressBuckets={stressBuckets} evidenceCards={evidenceCards.cards ?? []} />
    </>
  );
}
