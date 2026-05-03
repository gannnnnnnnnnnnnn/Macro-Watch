"use client";

import { useEffect, useMemo, useRef } from "react";
import { createChart, LineSeries } from "lightweight-charts";
import type { HistoryRow, IndicatorHistoryRow } from "@/lib/types";

type ChartPoint = {
  date?: string;
  value?: number | null;
};

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
}: {
  market?: HistoryRow[];
  indicator?: IndicatorHistoryRow[];
  height?: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const points = useMemo(() => {
    const source = market ? marketRows(market) : indicatorRows(indicator);
    return source
      .filter((point): point is { date: string; value: number } => Boolean(point.date) && typeof point.value === "number")
      .map((point) => ({ time: point.date, value: point.value }));
  }, [market, indicator]);

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
    chart.timeScale().fitContent();

    const resize = () => chart.applyOptions({ width: element.clientWidth, height });
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [height, points]);

  if (points.length < 2) {
    return (
      <div className="flex h-72 items-center justify-center rounded border border-line bg-ink text-sm text-slate-500">
        No chart history available. Run the local pipeline for generated chart data.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-ink p-3">
      <div ref={container} className="w-full" style={{ height }} />
      <p className="mt-2 text-right text-[11px] text-slate-600">Charts by TradingView Lightweight Charts. Local JSON data.</p>
    </div>
  );
}
