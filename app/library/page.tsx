import { EvidenceLibraryClient } from "@/components/EvidenceLibraryClient";
import { MetricTile, ShellTitle } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

export default function LibraryPage() {
  const { evidenceCards, signalCards, stressEngine } = getCockpitData();
  const cards = evidenceCards.cards ?? [];
  const modules = new Set(cards.map((card) => card.module).filter(Boolean));
  const tags = new Set(cards.flatMap((card) => card.tags ?? []));
  const deterministicCount = cards.filter((card) => card.ai_generated === false).length;

  return (
    <>
      <ShellTitle title="Evidence Library" eyebrow="Mechanical evidence cards" source={evidenceCards.source} />
      <p className="mb-4 max-w-3xl text-sm text-slate-400">
        Read-only deterministic references from local signal cards. No AI analysis, news ingestion, editable notes, or trading advice yet.
      </p>
      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Evidence cards" value={cards.length} detail="generated/mock fallback" />
        <MetricTile label="Modules" value={modules.size} detail="filterable evidence groups" />
        <MetricTile label="Tags" value={tags.size} detail={`${signalCards.cards?.length ?? 0} mechanical observations`} />
        <MetricTile label="Deterministic" value={deterministicCount} detail={`${stressEngine.buckets?.length ?? 0} stress buckets linked where available`} />
      </div>
      <EvidenceLibraryClient cards={cards} />
    </>
  );
}
