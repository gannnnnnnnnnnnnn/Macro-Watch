"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/Cockpit";
import { formatDate } from "@/lib/format";
import type { EvidenceCard } from "@/lib/types";

export function EvidenceLibraryClient({ cards }: { cards: EvidenceCard[] }) {
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("all");
  const modules = useMemo(() => ["all", ...Array.from(new Set(cards.map((card) => card.module).filter(Boolean)))], [cards]);
  const filtered = cards.filter((card) => {
    const haystack = [card.title, card.module, card.type, ...(card.source_ids ?? []), ...(card.tags ?? [])].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesModule = module === "all" || card.module === module;
    return matchesQuery && matchesModule;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-4 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, source id, tag"
          className="min-h-10 flex-1 rounded border border-line bg-ink px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
        />
        <select
          value={module}
          onChange={(event) => setModule(event.target.value)}
          className="min-h-10 rounded border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
        >
          {modules.map((item) => <option key={item} value={item}>{item === "all" ? "All modules" : item}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {(filtered.length ? filtered : []).map((card) => (
          <article key={card.id} className="rounded-lg border border-line bg-panel p-4 shadow-xl shadow-black/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-cyan-300">{card.module ?? "module"} · {card.type ?? "evidence"}</p>
                <h2 className="mt-2 text-lg font-semibold text-white">{card.title ?? card.id ?? "Evidence"}</h2>
              </div>
              <StatusBadge label={card.status} real={card.status === "real" || card.status === "ok"} />
            </div>
            <p className="mt-3 text-sm text-slate-300">{card.summary ?? "Mechanical evidence reference."}</p>
            <p className="mt-2 text-xs text-slate-500">{card.updated_at ? `Updated ${formatDate(card.updated_at)}` : "Updated N/A"} · AI generated: {card.ai_generated ? "yes" : "no"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(card.evidence ?? []).map((item, index) => item.href ? (
                <Link key={`${item.href}-${index}`} href={item.href} className="rounded border border-line px-2.5 py-1 text-xs text-cyan-200 hover:bg-ink">
                  {item.label ?? item.kind ?? "Open source"}
                </Link>
              ) : null)}
            </div>
            <p className="mt-3 text-xs text-slate-500">{card.interpretation_boundary ?? "No AI analysis or trading advice."}</p>
          </article>
        ))}
      </div>
      {!filtered.length ? <div className="rounded-lg border border-line bg-panel p-8 text-center text-sm text-slate-400">No evidence cards match the current filters.</div> : null}
    </div>
  );
}
