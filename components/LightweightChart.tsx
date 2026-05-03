"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createChart, LineSeries } from "lightweight-charts";
import type { HistoryRow, IndicatorHistoryRow } from "@/lib/types";
import { formatDate, formatValueWithUnit } from "@/lib/format";
import { useLanguage } from "./LanguageProvider";

type ChartPoint = {
  date?: string;
  value?: number | null;
};

type RangeKey = "1M" | "3M" | "6M" | "YTD" | "1Y" | "3Y" | "5Y" | "10Y" | "MAX";
type OverlayKey = "SMA20" | "SMA50" | "SMA200" | "EMA20" | "BB20";

const ranges: RangeKey[] = ["1M", "3M", "6M", "YTD", "1Y", "3Y", "5Y", "10Y", "MAX"];
const overlayLabels: OverlayKey[] = ["SMA20", "SMA50", "SMA200", "EMA20", "BB20"];

function marketRows(rows?: HistoryRow[]): ChartPoint[] {
  return (rows ?? []).map((row) => ({ date: row.date, value: row.close }));
}

function indicatorRows(rows?: IndicatorHistoryRow[]): ChartPoint[] {
  return (rows ?? []).map((row) => ({ date: row.date, value: row.value }));
}

export function LightweightChart({
  market,
  indicator,
  height = 320,
  unit,
  defaultRange,
  showOverlays = false,
  defaultOverlays = [],
}: {
  market?: HistoryRow[];
  indicator?: IndicatorHistoryRow[];
  height?: number;
  unit?: string | null;
  defaultRange?: RangeKey;
  showOverlays?: boolean;
  defaultOverlays?: OverlayKey[];
}) {
  const { t } = useLanguage();
  const container = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<RangeKey>(defaultRange ?? (indicator ? "5Y" : "1Y"));
  const [overlays, setOverlays] = useState<OverlayKey[]>(defaultOverlays);
  const allPoints = useMemo(() => {
    const source = market ? marketRows(market) : indicatorRows(indicator);
    return source
      .filter((point): point is { date: string; value: number } => Boolean(point.date) && typeof point.value === "number")
      .map((point) => ({ time: point.date, value: point.value }));
  }, [market, indicator]);
  const points = useMemo(() => downsample(sliceRange(allPoints, range)), [allPoints, range]);
  const latest = points.at(-1);
  const canShowOverlays = showOverlays && Boolean(market);

  useEffect(() => {
    if (!container.current || points.length < 2) return;
    const element = container.current;
    const chart = createChart(element, {
      height,
      layout: { background: { color: "#07090f" }, textColor: "#94a3b8" },
      grid: {
        vertLines: { color: "rgba(37, 43, 56, 0.55)" },
        horzLines: { color: "rgba(37, 43, 56, 0.55)" },
      },
      rightPriceScale: { borderColor: "#252b38" },
      timeScale: { borderColor: "#252b38", timeVisible: false },
      crosshair: { mode: 1 },
    });
    const series = chart.addSeries(LineSeries, {
      color: "#22d3ee",
      lineWidth: 2,
      crosshairMarkerVisible: true,
    });
    series.setData(points as never);

    if (canShowOverlays) {
      const overlayData = buildOverlays(points);
      for (const overlay of overlays) {
        const data = overlayData[overlay] ?? [];
        if (data.length < 2) continue;
        if (overlay === "BB20") {
          const bandData = data as { time: string; upper: number; lower: number }[];
          const upper = chart.addSeries(LineSeries, { color: "rgba(251, 191, 36, 0.55)", lineWidth: 1, crosshairMarkerVisible: false });
          const lower = chart.addSeries(LineSeries, { color: "rgba(251, 191, 36, 0.55)", lineWidth: 1, crosshairMarkerVisible: false });
          upper.setData(bandData.map((point) => ({ time: point.time, value: point.upper })) as never);
          lower.setData(bandData.map((point) => ({ time: point.time, value: point.lower })) as never);
        } else {
          const overlaySeries = chart.addSeries(LineSeries, {
            color: overlayColor(overlay),
            lineWidth: 1,
            crosshairMarkerVisible: false,
          });
          overlaySeries.setData(data as never);
        }
      }
    }

    chart.timeScale().fitContent();

    const resize = () => chart.applyOptions({ width: element.clientWidth, height });
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [canShowOverlays, height, overlays, points]);

  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center rounded border border-line bg-ink p-4 text-center text-sm text-slate-500" style={{ height }}>
        No chart history available. Run the local pipeline for generated chart data.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-ink p-3">
      <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{t("chartRange")}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {ranges.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRange(item)}
                className={`rounded border px-2 py-1 text-[11px] font-medium ${range === item ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "border-line text-slate-400 hover:text-white"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm text-slate-400 xl:text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Latest</p>
          <p className="mt-1 text-white">{latest ? formatValueWithUnit(latest.value, unit) : "Unavailable"} <span className="text-xs text-slate-500">{latest ? formatDate(String(latest.time)) : ""}</span></p>
        </div>
      </div>
      {canShowOverlays ? (
        <div className="mb-3 flex flex-wrap items-center gap-1 text-xs">
          <span className="mr-1 text-slate-500">{t("overlays")}</span>
          {overlayLabels.map((overlay) => {
            const active = overlays.includes(overlay);
            return (
              <button
                key={overlay}
                type="button"
                onClick={() => setOverlays((current) => active ? current.filter((item) => item !== overlay) : [...current, overlay])}
                className={`rounded border px-2 py-1 ${active ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "border-line text-slate-400 hover:text-white"}`}
              >
                {overlay}
              </button>
            );
          })}
        </div>
      ) : null}
      <div ref={container} className="w-full" style={{ height }} />
      <p className="mt-2 text-right text-[11px] text-slate-600">Charts by TradingView Lightweight Charts. Local JSON data.</p>
    </div>
  );
}

function sliceRange(points: { time: string; value: number }[], range: RangeKey) {
  if (range === "MAX" || points.length < 2) return points;
  const latest = new Date(points.at(-1)?.time ?? "");
  if (Number.isNaN(latest.getTime())) return points;
  const start = new Date(latest);
  if (range === "YTD") {
    start.setMonth(0, 1);
  } else {
    const months = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12, "3Y": 36, "5Y": 60, "10Y": 120 }[range];
    start.setMonth(start.getMonth() - months);
  }
  return points.filter((point) => new Date(point.time) >= start);
}

function downsample<T>(points: T[], max = 1400) {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const sampled = points.filter((_, index) => index % step === 0);
  const last = points.at(-1);
  return last && sampled.at(-1) !== last ? [...sampled, last] : sampled;
}

function movingAverage(points: { time: string; value: number }[], window: number) {
  return points.flatMap((point, index) => {
    if (index + 1 < window) return [];
    const slice = points.slice(index + 1 - window, index + 1);
    const value = slice.reduce((sum, item) => sum + item.value, 0) / window;
    return [{ time: point.time, value }];
  });
}

function exponentialAverage(points: { time: string; value: number }[], window: number) {
  const k = 2 / (window + 1);
  let ema = points[0]?.value ?? 0;
  return points.map((point, index) => {
    ema = index === 0 ? point.value : point.value * k + ema * (1 - k);
    return { time: point.time, value: ema };
  });
}

function bollinger(points: { time: string; value: number }[], window: number) {
  return points.flatMap((point, index) => {
    if (index + 1 < window) return [];
    const slice = points.slice(index + 1 - window, index + 1);
    const mean = slice.reduce((sum, item) => sum + item.value, 0) / window;
    const variance = slice.reduce((sum, item) => sum + Math.pow(item.value - mean, 2), 0) / window;
    const sd = Math.sqrt(variance);
    return [{ time: point.time, upper: mean + sd * 2, lower: mean - sd * 2 }];
  });
}

function buildOverlays(points: { time: string; value: number }[]) {
  return {
    SMA20: movingAverage(points, 20),
    SMA50: movingAverage(points, 50),
    SMA200: movingAverage(points, 200),
    EMA20: exponentialAverage(points, 20),
    BB20: bollinger(points, 20),
  };
}

function overlayColor(overlay: OverlayKey) {
  if (overlay === "SMA50") return "#a78bfa";
  if (overlay === "SMA200") return "#f59e0b";
  if (overlay === "EMA20") return "#34d399";
  return "#60a5fa";
}
