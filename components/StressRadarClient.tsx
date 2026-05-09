"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IndicatorList, StatusBadge } from "@/components/Cockpit";
import type { Indicator, IndicatorHistory, MarketHistory, StressEngine, StressIndicators } from "@/lib/types";

const bucketDefs = [
  { key: "Volatility stress", label: "Volatility", axis: "Vol", ids: ["VIX"], market: "VIX" },
  { key: "Credit stress", label: "Credit", axis: "Credit", ids: ["BAMLH0A0HYM2", "BAA10Y"] },
  { key: "Liquidity stress", label: "Liquidity", axis: "Liquid", ids: ["WALCL", "RRPONTSYD"] },
  { key: "Treasury market stress", label: "Treasury", axis: "Rates", ids: ["10y-2y-spread", "10y-3m-spread", "DGS10"] },
  { key: "Banking stress", label: "Banking", axis: "Bank", ids: [] },
  { key: "Household stress", label: "Household", axis: "House", ids: [] },
  { key: "Leverage stress", label: "Leverage", axis: "Leverage", ids: [] },
];

export function StressRadarClient({
  stress,
  indicatorHistory,
  marketHistory,
  stressEngine,
  compact = false,
}: {
  stress: StressIndicators;
  indicatorHistory: IndicatorHistory;
  marketHistory: MarketHistory;
  stressEngine?: StressEngine;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState(bucketDefs[0].key);
  const buckets = useMemo(() => bucketDefs.map((bucket) => buildBucket(bucket, stress, indicatorHistory, marketHistory, stressEngine)), [indicatorHistory, marketHistory, stress, stressEngine]);
  const selectedBucket = buckets.find((bucket) => bucket.key === selected) ?? buckets[0];
  const points = radarPoints(buckets.map((bucket) => bucket.value), 140, 140, 92).join(" ");

  return (
    <section className="rounded-lg border border-line bg-panel p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{compact ? "Stress radar preview" : "Coverage-aware stress radar"}</h2>
          <p className="mt-1 text-sm text-slate-500">{compact ? "Partial context, not a full score." : "Context percentile only. Partial bucket coverage, provisional directions, and no complete stress score or trading advice."}</p>
        </div>
        {compact ? <Link href="/stress" className="text-sm text-cyan-300 hover:text-cyan-100">Open Stress</Link> : <StatusBadge label="partial" />}
      </div>
      <div className={`grid gap-4 ${compact ? "" : "xl:grid-cols-[360px_1fr]"}`}>
        <div className="rounded-lg border border-line bg-ink p-4">
          <svg viewBox="0 0 292 292" className={`mx-auto w-full ${compact ? "h-[260px] max-w-[300px]" : "h-[330px] max-w-[360px]"}`} role="img" aria-label="Partial stress radar">
            {[0.25, 0.5, 0.75, 1].map((scale) => (
              <polygon key={scale} points={radarPoints(bucketDefs.map(() => scale * 100), 140, 140, 92).join(" ")} fill="none" stroke="rgba(148, 163, 184, 0.14)" />
            ))}
            {buckets.map((bucket, index) => {
              const [x, y] = axisPoint(index, buckets.length, 140, 140, 118);
              return (
                <g key={bucket.key}>
                  <line x1="140" y1="140" x2={x} y2={y} stroke="rgba(148, 163, 184, 0.16)" />
                  <text
                    x={x}
                    y={y}
                    onClick={() => setSelected(bucket.key)}
                    textAnchor={x < 140 ? "end" : x > 140 ? "start" : "middle"}
                    dominantBaseline="middle"
                    className={`cursor-pointer ${bucket.status === "pending" ? "fill-slate-600 text-[8px]" : "fill-slate-300 text-[8px]"}`}
                  >
                    {bucket.axis}
                  </text>
                </g>
              );
            })}
            <polygon points={points} fill="rgba(34, 211, 238, 0.18)" stroke="#22d3ee" strokeWidth="2" />
            {radarPoints(buckets.map((bucket) => bucket.value), 140, 140, 92).map((point, index) => (
              <circle key={buckets[index].key} cx={point.split(",")[0]} cy={point.split(",")[1]} r="3.5" className={buckets[index].status === "pending" ? "fill-slate-600" : "fill-cyan-300"} />
            ))}
          </svg>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-500 sm:grid-cols-4">
            {buckets.map((bucket) => <span key={bucket.key}><span className="text-slate-300">{bucket.axis}</span> {bucket.label}</span>)}
          </div>
        </div>
        {compact ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {buckets.filter((bucket) => bucket.status !== "pending").slice(0, 3).map((bucket) => (
              <div key={bucket.key} className="rounded border border-line bg-ink p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{bucket.label}</p>
                <p className="mt-1 text-lg font-semibold text-white">{Math.round(bucket.value)} pctile</p>
              </div>
            ))}
          </div>
        ) : (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {buckets.map((bucket) => (
              <button
                key={bucket.key}
                type="button"
                onClick={() => setSelected(bucket.key)}
                className={`rounded-lg border p-3 text-left transition ${selected === bucket.key ? "border-cyan-400/50 bg-cyan-400/10" : "border-line bg-ink hover:border-cyan-400/30"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-white">{bucket.label}</p>
                  <StatusBadge label={bucket.status} real={bucket.status === "real"} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{bucket.note}</p>
                <p className="mt-2 text-lg font-semibold text-slate-200">{bucket.status === "pending" ? "Pending" : `${Math.round(bucket.value)} context pctile`}</p>
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-ink p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{selectedBucket.label}</p>
                <p className="text-xs text-slate-500">{selectedBucket.note} Context only; not a score.</p>
              </div>
              <StatusBadge label={selectedBucket.status} real={selectedBucket.status === "real"} />
            </div>
            <IndicatorList items={selectedBucket.items} />
          </div>
        </div>
        )}
      </div>
    </section>
  );
}

function buildBucket(
  bucket: { key: string; label: string; axis: string; ids: string[]; market?: string },
  stress: StressIndicators,
  indicatorHistory: IndicatorHistory,
  marketHistory: MarketHistory,
  stressEngine?: StressEngine,
) {
  const engineBucket = stressEngine?.buckets?.find((item) => item.label === bucket.label || item.id === bucket.label.toLowerCase());
  const items = stress.buckets?.[bucket.key] ?? [];
  const values: number[] = [];
  for (const id of bucket.ids) {
    const rows = indicatorHistory.indicators?.[id]?.rows?.map((row) => row.value).filter((value): value is number => typeof value === "number") ?? [];
    const latest = rows.at(-1);
    if (typeof latest === "number") values.push(percentile(rows, bucket.key.includes("Treasury") ? -latest : latest, bucket.key.includes("Treasury")));
  }
  if (bucket.market) {
    const rows = marketHistory.symbols?.[bucket.market]?.rows?.map((row) => row.close).filter((value): value is number => typeof value === "number") ?? [];
    const latest = rows.at(-1);
    if (typeof latest === "number") values.push(percentile(rows, latest));
  }
  const realItems = items.filter((item) => item.real_data);
  const value = typeof engineBucket?.context_percentile === "number"
    ? engineBucket.context_percentile * 100
    : values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : 0;
  const status = engineBucket?.status ?? (realItems.length && realItems.length === items.length ? "real" : realItems.length || values.length ? "partial" : "pending");
  const note = engineBucket?.severity ? `${engineBucket.severity} severity · ${engineBucket.momentum ?? "unknown"} momentum.` : status === "pending" ? "Not wired yet." : `${values.length || realItems.length} context series wired.`;
  return { ...bucket, value, status, note, items: items.length ? items : [{ name: bucket.label, status: "pending", note: "Not wired yet.", value: null }] as Indicator[] };
}

function percentile(values: number[], latest: number, invert = false) {
  const transformed = invert ? values.map((value) => -value) : values;
  const compare = invert ? latest : latest;
  const below = transformed.filter((value) => value <= compare).length;
  return (below / Math.max(transformed.length, 1)) * 100;
}

function axisPoint(index: number, total: number, cx: number, cy: number, radius: number) {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

function radarPoints(values: number[], cx: number, cy: number, radius: number) {
  return values.map((value, index) => {
    const [x, y] = axisPoint(index, values.length, cx, cy, (Math.max(0, Math.min(100, value)) / 100) * radius);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
}
