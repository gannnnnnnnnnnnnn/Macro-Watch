"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/Cockpit";
import { evidenceHref } from "@/lib/evidenceRoutes";
import { formatDate } from "@/lib/format";
import type { EvidenceCard } from "@/lib/types";

export function EvidenceLibraryClient({ cards }: { cards: EvidenceCard[] }) {
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [tag, setTag] = useState("all");
  const modules = useMemo(() => ["all", ...Array.from(new Set(cards.map((card) => card.module).filter(Boolean)))], [cards]);
  const types = useMemo(() => ["all", ...Array.from(new Set(cards.map((card) => card.type).filter(Boolean)))], [cards]);
  const statuses = useMemo(() => ["all", ...Array.from(new Set(cards.map((card) => card.status).filter(Boolean)))], [cards]);
  const tags = useMemo(() => ["all", ...Array.from(new Set(cards.flatMap((card) => card.tags ?? [])))], [cards]);
  const filtered = cards.filter((card) => {
    const haystack = [card.title, card.summary, card.module, card.type, card.status, ...(card.source_ids ?? []), ...(card.tags ?? [])].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesModule = module === "all" || card.module === module;
    const matchesType = type === "all" || card.type === type;
    const matchesStatus = status === "all" || card.status === status;
    const matchesTag = tag === "all" || card.tags?.includes(tag);
    return matchesQuery && matchesModule && matchesType && matchesStatus && matchesTag;
  });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-panel p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>{filtered.length} of {cards.length} cards</span>
          <span>·</span>
          <span>{modules.length - 1} modules</span>
          <span>·</span>
          <span>{tags.length - 1} tags</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_repeat(4,11rem)]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, summary, source id, tag"
          className="min-h-10 flex-1 rounded border border-line bg-ink px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
        />
        <select
          value={module}
          onChange={(event) => setModule(event.target.value)}
          className="min-h-10 rounded border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
        >
          {modules.map((item) => <option key={item} value={item}>{item === "all" ? "All modules" : item}</option>)}
        </select>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="min-h-10 rounded border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
        >
          {types.map((item) => <option key={item} value={item}>{item === "all" ? "All types" : item}</option>)}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="min-h-10 rounded border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
        >
          {statuses.map((item) => <option key={item} value={item}>{item === "all" ? "All statuses" : item}</option>)}
        </select>
        <select
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          className="min-h-10 rounded border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
        >
          {tags.map((item) => <option key={item} value={item}>{item === "all" ? "All tags" : item}</option>)}
        </select>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {(filtered.length ? filtered : []).map((card) => (
          <article key={card.id} className="rounded-lg border border-line bg-panel p-4 shadow-xl shadow-black/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-cyan-300">{card.module ?? "module"} · {card.type ?? "evidence"}</p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  {card.id ? <Link href={evidenceHref(card.id)} className="hover:text-cyan-300">{card.title ?? card.id}</Link> : card.title ?? "Evidence"}
                </h2>
              </div>
              <StatusBadge label={card.status} real={card.status === "real" || card.status === "ok"} />
            </div>
            <p className="mt-3 text-sm text-slate-300">{card.summary ?? "Mechanical evidence reference."}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(card.source_ids?.length ? card.source_ids : ["No source id"]).map((sourceId) => (
                <span key={sourceId} className="rounded border border-line bg-ink px-2.5 py-1 text-xs text-slate-300">{sourceId}</span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{card.updated_at ? `Updated ${formatDate(card.updated_at)}` : "Updated N/A"} · AI generated: {card.ai_generated ? "yes" : "no"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {card.id ? (
                <Link href={evidenceHref(card.id)} className="rounded border border-cyan-400/30 px-2.5 py-1 text-xs text-cyan-200 hover:bg-ink">
                  Open evidence
                </Link>
              ) : null}
              {(card.evidence ?? []).map((item, index) => item.href ? (
                <Link key={`${item.href}-${index}`} href={item.href} className="rounded border border-line px-2.5 py-1 text-xs text-cyan-200 hover:bg-ink">
                  {item.label ?? item.kind ?? "Open source"}
                </Link>
              ) : null)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(card.tags ?? []).slice(0, 5).map((item) => (
                <button key={item} type="button" onClick={() => setTag(item)} className="rounded bg-ink px-2 py-1 text-xs text-slate-400 hover:text-cyan-200">{item}</button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">{card.interpretation_boundary ?? "No AI analysis or trading advice."}</p>
          </article>
        ))}
      </div>
      {!filtered.length ? <div className="rounded-lg border border-line bg-panel p-8 text-center text-sm text-slate-400">No evidence cards match the current filters.</div> : null}
    </div>
  );
}
