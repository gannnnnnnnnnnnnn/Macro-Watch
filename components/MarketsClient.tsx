"use client";

import { useMemo, useState } from "react";
import { AssetCard, MiniLineChart, Panel, Sparkline, StatusBadge } from "@/components/Cockpit";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import type { Asset, MarketHistory } from "@/lib/types";

export function MarketsClient({ assets, history }: { assets: Asset[]; history: MarketHistory }) {
  const defaultSymbol = assets[0]?.symbol ?? "";
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const selected = useMemo(
    () => assets.find((asset) => asset.symbol === selectedSymbol) ?? assets[0],
    [assets, selectedSymbol],
  );
  const selectedHistory = selected?.symbol ? history.symbols?.[selected.symbol] : undefined;

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Market overview">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {assets.slice(0, 8).map((asset, index) => (
              <button key={`${asset.symbol}-${index}`} type="button" onClick={() => setSelectedSymbol(asset.symbol ?? "")} className="text-left">
                <AssetCard asset={asset} history={history.symbols?.[asset.symbol ?? ""]} />
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Selected asset">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold text-white">{selected?.symbol ?? "N/A"}</p>
                <p className="mt-1 text-sm text-slate-400">{selected?.name ?? "Unavailable"}</p>
              </div>
              <StatusBadge label={selected?.status} real={selected?.real_data} />
            </div>
            <p className="text-4xl font-semibold text-white">{selected?.value ?? "Unavailable"}<span className="ml-2 text-sm text-slate-500">{selected?.unit ?? ""}</span></p>
            <MiniLineChart rows={selectedHistory?.rows} positive={(selected?.change ?? 0) >= 0} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded border border-line bg-ink p-3"><p className="text-slate-500">Provider</p><p className="text-white">{selected?.provider ?? "N/A"}</p></div>
              <div className="rounded border border-line bg-ink p-3"><p className="text-slate-500">Latest date</p><p className="text-white">{selected?.latest_date ?? "N/A"}</p></div>
            </div>
          </div>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Panel title="Watchlist table">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="py-2">Symbol</th><th>Name</th><th>Latest</th><th>Change</th><th>Provider</th><th>Date</th><th>Data</th><th>Trend</th><th></th></tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const active = asset.symbol === selected?.symbol;
                  return (
                    <tr key={asset.symbol} className={`border-t border-line ${active ? "bg-cyan-400/5" : ""}`}>
                      <td className="py-3 font-medium text-white">{asset.symbol ?? "N/A"}</td>
                      <td className="text-slate-300">{asset.name ?? "Unavailable"}</td>
                      <td>{asset.value ?? "N/A"}{asset.unit ? ` ${asset.unit}` : ""}</td>
                      <td className={typeof asset.change === "number" && asset.change < 0 ? "text-loss" : "text-gain"}>{typeof asset.change === "number" ? `${asset.change > 0 ? "+" : ""}${asset.change.toFixed(2)}%` : "N/A"}</td>
                      <td className="text-slate-400">{asset.provider ?? "N/A"}</td>
                      <td className="text-slate-400">{asset.latest_date ?? "N/A"}</td>
                      <td><StatusBadge label={asset.status} real={asset.real_data} /></td>
                      <td className="w-32"><Sparkline rows={history.symbols?.[asset.symbol ?? ""]?.rows} positive={(asset.change ?? 0) >= 0} /></td>
                      <td><button type="button" onClick={() => setSelectedSymbol(asset.symbol ?? "")} className="rounded border border-line px-2 py-1 text-xs text-slate-300 hover:bg-panel hover:text-white">{active ? "Selected" : "Select"}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="TradingView reference">
          <TradingViewWidget symbol={selected?.symbol} />
          <p className="mt-3 text-xs text-slate-500">Embedded public TradingView widget. Local generated JSON remains the primary data contract.</p>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {assets.slice(0, 4).map((asset, index) => (
          <Panel key={`${asset.symbol}-spark-${index}`} title={asset.symbol ?? "Asset"}>
            <Sparkline rows={history.symbols?.[asset.symbol ?? ""]?.rows} positive={(asset.change ?? 0) >= 0} />
          </Panel>
        ))}
      </div>
    </>
  );
}
