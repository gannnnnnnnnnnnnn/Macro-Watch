"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Panel, StatusBadge } from "@/components/Cockpit";
import { evidenceHref } from "@/lib/evidenceRoutes";
import { assetHref, indicatorHref } from "@/lib/routes";
import { stressBucketHref } from "@/lib/stressRoutes";
import { formatDate, formatDelta, formatPercent, formatValueWithUnit } from "@/lib/format";
import type { Asset, EvidenceCard, Indicator, StressEngineBucket } from "@/lib/types";

type WorkspaceState = {
  assets: string[];
  indicators: string[];
  stressBuckets: string[];
  evidenceIds: string[];
  thesisTitle?: string;
};

const STORAGE_KEY = "macro-watch:workspace:v1";

const fallbackState: WorkspaceState = {
  assets: [],
  indicators: [],
  stressBuckets: [],
  evidenceIds: [],
  thesisTitle: "Macro watchlist",
};

export function ResearchWorkspaceClient({
  assets,
  indicators,
  stressBuckets,
  evidenceCards,
}: {
  assets: Asset[];
  indicators: Indicator[];
  stressBuckets: StressEngineBucket[];
  evidenceCards: EvidenceCard[];
}) {
  const defaultWorkspace = useMemo(() => buildDefaultWorkspace(assets, indicators, stressBuckets, evidenceCards), [assets, indicators, stressBuckets, evidenceCards]);
  const [workspace, setWorkspace] = useState<WorkspaceState>(defaultWorkspace);
  const [assetQuery, setAssetQuery] = useState("");
  const [indicatorQuery, setIndicatorQuery] = useState("");
  const [evidenceQuery, setEvidenceQuery] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loaded = readWorkspace(defaultWorkspace);
    setWorkspace(loaded);
    writeWorkspace(loaded);
    const onUpdate = () => setWorkspace(readWorkspace(defaultWorkspace));
    window.addEventListener("storage", onUpdate);
    window.addEventListener("macro-watch:workspace-updated", onUpdate);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("macro-watch:workspace-updated", onUpdate);
    };
  }, [defaultWorkspace]);

  function update(next: WorkspaceState) {
    setWorkspace(next);
    writeWorkspace(next);
    window.dispatchEvent(new CustomEvent("macro-watch:workspace-updated"));
  }

  function add(key: keyof Pick<WorkspaceState, "assets" | "indicators" | "stressBuckets" | "evidenceIds">, id: string | undefined) {
    if (!id) return;
    update({ ...workspace, [key]: workspace[key].includes(id) ? workspace[key] : [...workspace[key], id] });
  }

  function remove(key: keyof Pick<WorkspaceState, "assets" | "indicators" | "stressBuckets" | "evidenceIds">, id: string | undefined) {
    if (!id) return;
    update({ ...workspace, [key]: workspace[key].filter((item) => item !== id) });
  }

  const selectedAssets = workspace.assets.map((id) => assets.find((asset) => asset.symbol === id) ?? ({ symbol: id, name: "Unavailable", status: "missing" } satisfies Asset));
  const selectedIndicators = workspace.indicators.map((id) => indicators.find((indicator) => indicator.id === id || indicator.series_id === id) ?? ({ id, label: id, status: "missing" } satisfies Indicator));
  const selectedStressBuckets = workspace.stressBuckets.map((id) => stressBuckets.find((bucket) => bucket.id === id) ?? ({ id, label: id, status: "missing" } satisfies StressEngineBucket));
  const selectedEvidence = workspace.evidenceIds.map((id) => evidenceCards.find((card) => card.id === id) ?? ({ id, title: id, summary: "Evidence card unavailable.", status: "missing" } satisfies EvidenceCard));

  const assetResults = filterItems(assets, assetQuery, (asset) => [asset.symbol, asset.label, asset.name, asset.group, ...(asset.tags ?? [])]).slice(0, 8);
  const indicatorResults = filterItems(indicators, indicatorQuery, (indicator) => [indicator.id, indicator.series_id, indicator.label, indicator.name, indicator.bucket, ...(indicator.tags ?? [])]).slice(0, 8);
  const evidenceResults = filterItems(evidenceCards, evidenceQuery, (card) => [card.id, card.title, card.summary, card.module, card.type, card.status, ...(card.tags ?? []), ...(card.source_ids ?? [])]).slice(0, 8);
  const evidencePack = buildEvidencePack(selectedAssets, selectedIndicators, selectedStressBuckets, selectedEvidence);

  async function copyPack() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(evidencePack);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.55fr_1fr_0.75fr]">
      <div className="space-y-4">
        <Panel title="Workspace controls">
          <label className="text-xs uppercase tracking-wide text-slate-500" htmlFor="workspace-title">Thesis title</label>
          <input
            id="workspace-title"
            value={workspace.thesisTitle ?? ""}
            onChange={(event) => update({ ...workspace, thesisTitle: event.target.value })}
            className="mt-2 min-h-10 w-full rounded border border-line bg-ink px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
          />
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-300">
            <Count label="Assets" value={workspace.assets.length} />
            <Count label="Indicators" value={workspace.indicators.length} />
            <Count label="Stress" value={workspace.stressBuckets.length} />
            <Count label="Evidence" value={workspace.evidenceIds.length} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => update(defaultWorkspace)} className="rounded border border-line px-3 py-2 text-sm text-slate-300 hover:bg-ink hover:text-white">
              Load default
            </button>
            <button type="button" onClick={() => update({ ...fallbackState, thesisTitle: workspace.thesisTitle })} className="rounded border border-line px-3 py-2 text-sm text-slate-300 hover:bg-ink hover:text-white">
              Reset workspace
            </button>
          </div>
        </Panel>

        <SearchPanel title="Add assets" query={assetQuery} onQuery={setAssetQuery} placeholder="Search symbol, name, group">
          {assetResults.map((asset) => (
            <SelectorRow key={asset.symbol} title={asset.symbol ?? "N/A"} detail={`${asset.name ?? "Unavailable"} · ${asset.group ?? "Ungrouped"}`} added={workspace.assets.includes(asset.symbol ?? "")} onAdd={() => add("assets", asset.symbol)} />
          ))}
        </SearchPanel>

        <SearchPanel title="Add indicators" query={indicatorQuery} onQuery={setIndicatorQuery} placeholder="Search id, label, group">
          {indicatorResults.map((indicator) => (
            <SelectorRow key={indicator.id ?? indicator.series_id} title={indicator.label ?? indicator.id ?? "N/A"} detail={`${indicator.id ?? indicator.series_id ?? "No id"} · ${indicator.bucket ?? indicator.provider ?? "Local JSON"}`} added={workspace.indicators.includes(indicator.id ?? "")} onAdd={() => add("indicators", indicator.id)} />
          ))}
        </SearchPanel>
      </div>

      <div className="space-y-4">
        <Panel title="Selected assets">
          <div className="grid gap-3 lg:grid-cols-2">
            {selectedAssets.length ? selectedAssets.map((asset) => (
              <ItemCard key={asset.symbol} href={asset.symbol ? assetHref(asset.symbol) : undefined} title={asset.symbol ?? "N/A"} subtitle={asset.name ?? "Unavailable"} status={<StatusBadge label={asset.status} real={asset.real_data} />} onRemove={() => remove("assets", asset.symbol)}>
                <p className="text-xl font-semibold text-white">{formatValueWithUnit(asset.value, asset.unit)}</p>
                <p className={typeof asset.change === "number" && asset.change < 0 ? "text-sm text-loss" : "text-sm text-gain"}>{formatPercent(asset.change)}</p>
                <p className="text-xs text-slate-500">{asset.latest_date ? formatDate(asset.latest_date) : "date N/A"}</p>
              </ItemCard>
            )) : <EmptyState label="No assets selected." />}
          </div>
        </Panel>

        <Panel title="Selected indicators">
          <div className="grid gap-3 lg:grid-cols-2">
            {selectedIndicators.length ? selectedIndicators.map((indicator) => (
              <ItemCard key={indicator.id} href={indicator.id ? indicatorHref(indicator.id) : undefined} title={indicator.label ?? indicator.id ?? "N/A"} subtitle={indicator.id ?? indicator.series_id ?? "No source id"} status={<StatusBadge label={indicator.status} real={indicator.real_data} />} onRemove={() => remove("indicators", indicator.id)}>
                <p className="text-xl font-semibold text-white">{formatValueWithUnit(indicator.value, indicator.unit)}</p>
                <p className="text-sm text-slate-400">{indicator.delta_label ?? (typeof indicator.delta === "number" ? formatDelta(indicator.delta, indicator.unit ?? "") : "Last obs unavailable")}</p>
                <p className="text-xs text-slate-500">{indicator.one_year_delta_label ?? "1Y unavailable"}</p>
              </ItemCard>
            )) : <EmptyState label="No indicators selected." />}
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Stress buckets">
          <div className="mb-3 flex flex-wrap gap-2">
            {stressBuckets.map((bucket) => (
              <button
                key={bucket.id}
                type="button"
                onClick={() => workspace.stressBuckets.includes(bucket.id ?? "") ? remove("stressBuckets", bucket.id) : add("stressBuckets", bucket.id)}
                className={`rounded border px-3 py-2 text-sm ${workspace.stressBuckets.includes(bucket.id ?? "") ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100" : "border-line text-slate-300 hover:bg-ink"}`}
              >
                {bucket.label ?? bucket.id}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {selectedStressBuckets.length ? selectedStressBuckets.map((bucket) => (
              <ItemCard key={bucket.id} href={bucket.id ? stressBucketHref(bucket.id) : undefined} title={bucket.label ?? bucket.id ?? "N/A"} subtitle={`Severity ${bucket.severity ?? "unknown"} · Momentum ${bucket.momentum ?? "unknown"}`} status={<StatusBadge label={bucket.confidence ?? bucket.status} />} onRemove={() => remove("stressBuckets", bucket.id)}>
                <p className="text-sm text-slate-400">Drivers: {bucket.drivers?.length ?? 0} · Counter: {bucket.counter_evidence?.length ?? 0}</p>
                <p className="text-xs text-slate-500">{bucket.coverage_note ?? "Coverage context unavailable."}</p>
              </ItemCard>
            )) : <EmptyState label="No stress buckets selected." />}
          </div>
        </Panel>

        <SearchPanel title="Add evidence cards" query={evidenceQuery} onQuery={setEvidenceQuery} placeholder="Search title, source, tag">
          {evidenceResults.map((card) => (
            <SelectorRow key={card.id} title={card.title ?? card.id ?? "Evidence"} detail={`${card.module ?? "module"} · ${(card.source_ids ?? []).join(", ") || "No source ids"}`} added={workspace.evidenceIds.includes(card.id ?? "")} onAdd={() => add("evidenceIds", card.id)} />
          ))}
        </SearchPanel>

        <Panel title="Evidence cards">
          <div className="space-y-3">
            {selectedEvidence.length ? selectedEvidence.map((card) => (
              <ItemCard key={card.id} href={card.id ? evidenceHref(card.id) : undefined} title={card.title ?? card.id ?? "Evidence"} subtitle={`${card.module ?? "module"} · ${card.type ?? "evidence"}`} status={<StatusBadge label={card.status} real={card.status === "real" || card.status === "ok"} />} onRemove={() => remove("evidenceIds", card.id)}>
                <p className="text-sm text-slate-300">{card.summary ?? "Mechanical evidence reference."}</p>
                <p className="text-xs text-slate-500">{card.source_ids?.join(", ") ?? "No source ids"}</p>
              </ItemCard>
            )) : <EmptyState label="No evidence cards selected." />}
          </div>
        </Panel>

        <Panel title="Evidence Pack Preview">
          <pre className="whitespace-pre-wrap rounded border border-line bg-ink p-3 text-xs leading-6 text-slate-300">{evidencePack}</pre>
          <button type="button" onClick={copyPack} className="mt-3 rounded border border-cyan-400/30 px-3 py-2 text-sm text-cyan-200 hover:bg-ink">
            {copied ? "Copied" : "Copy preview"}
          </button>
        </Panel>
      </div>
    </div>
  );
}

function readWorkspace(defaultWorkspace: WorkspaceState): WorkspaceState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWorkspace;
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    const next = {
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
      stressBuckets: Array.isArray(parsed.stressBuckets) ? parsed.stressBuckets : [],
      evidenceIds: Array.isArray(parsed.evidenceIds) ? parsed.evidenceIds : [],
      thesisTitle: typeof parsed.thesisTitle === "string" ? parsed.thesisTitle : defaultWorkspace.thesisTitle,
    };
    return next.assets.length || next.indicators.length || next.stressBuckets.length || next.evidenceIds.length ? next : defaultWorkspace;
  } catch {
    return defaultWorkspace;
  }
}

function writeWorkspace(workspace: WorkspaceState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

function buildDefaultWorkspace(assets: Asset[], indicators: Indicator[], stressBuckets: StressEngineBucket[], evidenceCards: EvidenceCard[]): WorkspaceState {
  const wantedAssets = ["SPY", "QQQ", "TLT", "DXY", "GC=F"];
  const wantedIndicators = ["DGS10", "DGS2", "T10YIE", "CPIAUCSL", "cpi-yoy", "BAMLH0A0HYM2"];
  const wantedStress = ["credit", "liquidity", "treasury"];
  return {
    thesisTitle: "Macro watchlist",
    assets: wantedAssets.filter((id) => assets.some((asset) => asset.symbol === id)),
    indicators: wantedIndicators.filter((id) => indicators.some((indicator) => indicator.id === id)),
    stressBuckets: wantedStress.filter((id) => stressBuckets.some((bucket) => bucket.id === id)),
    evidenceIds: evidenceCards.map((card) => card.id).filter((id): id is string => Boolean(id)).slice(0, 4),
  };
}

function filterItems<T>(items: T[], query: string, values: (item: T) => (string | undefined | null)[]) {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) => values(item).filter(Boolean).join(" ").toLowerCase().includes(needle));
}

function buildEvidencePack(assets: Asset[], indicators: Indicator[], stressBuckets: StressEngineBucket[], evidenceCards: EvidenceCard[]) {
  const sourceIds = new Set(evidenceCards.flatMap((card) => card.source_ids ?? []));
  return [
    "Workspace Evidence Pack",
    `- Assets selected: ${assets.map((item) => item.symbol).filter(Boolean).join(", ") || "None"}`,
    `- Indicators selected: ${indicators.map((item) => item.id ?? item.series_id).filter(Boolean).join(", ") || "None"}`,
    `- Stress buckets selected: ${stressBuckets.map((item) => item.id).filter(Boolean).join(", ") || "None"}`,
    `- Evidence cards selected: ${evidenceCards.map((item) => item.id).filter(Boolean).join(", ") || "None"}`,
    `- Key source IDs: ${Array.from(sourceIds).join(", ") || "None"}`,
  ].join("\n");
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-line bg-ink p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SearchPanel({ title, query, onQuery, placeholder, children }: { title: string; query: string; onQuery: (value: string) => void; placeholder: string; children: React.ReactNode }) {
  return (
    <Panel title={title}>
      <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder={placeholder} className="mb-3 min-h-10 w-full rounded border border-line bg-ink px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50" />
      <div className="space-y-2">{children}</div>
    </Panel>
  );
}

function SelectorRow({ title, detail, added, onAdd }: { title: string; detail: string; added: boolean; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-line bg-ink p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{detail}</p>
      </div>
      <button type="button" onClick={onAdd} disabled={added} className={`shrink-0 rounded border px-2.5 py-1 text-xs ${added ? "border-emerald-400/30 text-emerald-200" : "border-cyan-400/30 text-cyan-200 hover:bg-panel"}`}>
        {added ? "Added" : "Add"}
      </button>
    </div>
  );
}

function ItemCard({ title, subtitle, href, status, onRemove, children }: { title: string; subtitle?: string; href?: string; status?: React.ReactNode; onRemove: () => void; children: React.ReactNode }) {
  const titleNode = href ? <Link href={href} className="hover:text-cyan-300">{title}</Link> : title;
  return (
    <article className="rounded border border-line bg-ink p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-medium text-white">{titleNode}</p>
          {subtitle ? <p className="mt-1 break-words text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {status}
      </div>
      <div className="mt-3 space-y-1">{children}</div>
      <button type="button" onClick={onRemove} className="mt-3 rounded border border-line px-2.5 py-1 text-xs text-slate-400 hover:bg-panel hover:text-white">
        Remove
      </button>
    </article>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded border border-line bg-ink p-4 text-sm text-slate-500">{label}</div>;
}
