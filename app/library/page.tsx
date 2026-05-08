import { EvidenceLibraryClient } from "@/components/EvidenceLibraryClient";
import { MetricTile, ShellTitle } from "@/components/Cockpit";
import { getCockpitData } from "@/lib/data";

export default function LibraryPage() {
  const { evidenceCards, signalCards, stressEngine } = getCockpitData();
  const cards = evidenceCards.cards ?? [];
  const modules = new Set(cards.map((card) => card.module).filter(Boolean));

  return (
    <>
      <ShellTitle title="Evidence Library" eyebrow="Mechanical evidence cards" />
      <p className="mb-4 max-w-3xl text-sm text-slate-400">
        Read-only deterministic references from local signal cards. No AI analysis, news ingestion, editable notes, or trading advice yet.
      </p>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <MetricTile label="Evidence cards" value={cards.length} detail="generated/mock fallback" />
        <MetricTile label="Signal cards" value={signalCards.cards?.length ?? 0} detail="mechanical observations" />
        <MetricTile label="Stress buckets" value={stressEngine.buckets?.length ?? 0} detail="skeleton only, no composite score" />
      </div>
      <EvidenceLibraryClient cards={cards} />
    </>
  );
}
