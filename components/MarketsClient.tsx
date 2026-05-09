"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AssetCard, Panel, Sparkline, StatusBadge } from "@/components/Cockpit";
import { LightweightChart } from "@/components/LightweightChart";
import { PinButton } from "@/components/PinsClient";
import { formatDate, formatPercent, formatValueWithUnit } from "@/lib/format";
import { assetHref } from "@/lib/routes";
import type { Asset, MarketHistory, PinConfig } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";

const pinStorageKey = "macro-watch:pins:v1";
const recentStorageKey = "macro-watch:recent-assets:v1";
const quickFilters = ["All", "Core", "Pinned", "Recent"] as const;

export function MarketsClient({ assets, history, defaultPins = [] }: { assets: Asset[]; history: MarketHistory; defaultPins?: PinConfig[] }) {
  const { t } = useLanguage();
  const defaultSymbol = assets[0]?.symbol ?? "";
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [group, setGroup] = useState("All");
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<(typeof quickFilters)[number]>("All");
  const [pinnedAssetIds, setPinnedAssetIds] = useState(() => defaultPins.filter((pin) => pin.type === "asset").map((pin) => pin.id));
  const [recentAssetIds, setRecentAssetIds] = useState<string[]>([]);
  const [view, setView] = useState<"cards" | "table">("cards");
  const groups = useMemo(() => ["All", ...Array.from(new Set(assets.map((asset) => asset.group).filter((item): item is string => Boolean(item))))], [assets]);
  const visibleAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return assets.filter((asset) => {
      const groupMatch = group === "All" || asset.group === group;
      const quickMatch =
        quickFilter === "All" ||
        (quickFilter === "Core" && asset.priority === "core") ||
        (quickFilter === "Pinned" && Boolean(asset.symbol && pinnedAssetIds.includes(asset.symbol))) ||
        (quickFilter === "Recent" && Boolean(asset.symbol && recentAssetIds.includes(asset.symbol)));
      const searchText = [asset.symbol, asset.label, asset.name, asset.group, asset.proxy, ...(asset.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
      const searchMatch = !normalizedQuery || searchText.includes(normalizedQuery);
      return groupMatch && quickMatch && searchMatch;
    });
  }, [assets, group, pinnedAssetIds, query, quickFilter, recentAssetIds]);
  const selected = useMemo(
    () => visibleAssets.find((asset) => asset.symbol === selectedSymbol) ?? visibleAssets[0] ?? assets.find((asset) => asset.symbol === selectedSymbol) ?? assets[0],
    [assets, selectedSymbol, visibleAssets],
  );
  const selectedHistory = selected?.symbol ? history.symbols?.[selected.symbol] : undefined;
  const chooseAsset = (symbol?: string) => {
    if (!symbol) return;
    setSelectedSymbol(symbol);
    setRecentAssetIds((current) => {
      const next = [symbol, ...current.filter((item) => item !== symbol)].slice(0, 8);
      window.localStorage.setItem(recentStorageKey, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const syncPins = () => {
      try {
        const raw = window.localStorage.getItem(pinStorageKey);
        const pins = raw ? JSON.parse(raw) as PinConfig[] : defaultPins;
        setPinnedAssetIds((Array.isArray(pins) ? pins : defaultPins).filter((pin) => pin.type === "asset").map((pin) => pin.id));
      } catch {
        setPinnedAssetIds(defaultPins.filter((pin) => pin.type === "asset").map((pin) => pin.id));
      }
    };
    const rawRecent = window.localStorage.getItem(recentStorageKey);
    if (rawRecent) {
      try {
        const parsed = JSON.parse(rawRecent) as string[];
        if (Array.isArray(parsed)) setRecentAssetIds(parsed.filter(Boolean));
      } catch {
        setRecentAssetIds([]);
      }
    }
    syncPins();
    window.addEventListener("macro-watch:pins-changed", syncPins);
    window.addEventListener("storage", syncPins);
    return () => {
      window.removeEventListener("macro-watch:pins-changed", syncPins);
      window.removeEventListener("storage", syncPins);
    };
  }, [defaultPins]);

  return (
    <>
      <Panel>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{t("assetExplorer")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Market workbench</h2>
            <p className="mt-1 text-sm text-slate-400">Browse macro-relevant assets, then open a focused detail view when needed.</p>
          </div>
          <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
            {groups.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGroup(item)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium uppercase tracking-wide ${group === item ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "border-line bg-ink text-slate-400 hover:text-white"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </Panel>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
        <Panel title={t("selectedAsset")}>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-semibold text-white">{selected?.symbol ?? "N/A"}</p>
                {selected?.symbol ? <PinButton target={{ type: "asset", id: selected.symbol }} defaultPins={defaultPins} /> : null}
              </div>
              <p className="mt-1 text-sm text-slate-400">{selected?.name ?? "Unavailable"}{selected?.group ? ` · ${selected.group}` : ""}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm md:min-w-[320px]">
              <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">{t("latest")}</p><p className="mt-1 text-xl font-semibold text-white">{formatValueWithUnit(selected?.value, selected?.unit)}</p></div>
              <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">{t("change")}</p><p className={`mt-1 text-xl ${typeof selected?.change === "number" && selected.change < 0 ? "text-loss" : "text-gain"}`}>{formatPercent(selected?.change)}</p></div>
            </div>
          </div>
          <LightweightChart market={selectedHistory?.rows} height={400} unit={selected?.unit} showOverlays />
        </Panel>
        <Panel title="Find asset">
          <div className="space-y-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search symbol, name, group, tag"
              className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
            />
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuickFilter(item)}
                  className={`rounded border px-2.5 py-1.5 text-xs font-medium ${quickFilter === item ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "border-line bg-ink text-slate-400 hover:text-white"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {(visibleAssets.length ? visibleAssets : assets.slice(0, 8)).map((asset) => {
                const active = asset.symbol === selected?.symbol;
                return (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => chooseAsset(asset.symbol)}
                    className={`w-full rounded border p-2 text-left transition ${active ? "border-cyan-400/50 bg-cyan-400/10" : "border-line bg-ink hover:border-cyan-400/30"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-white">{asset.symbol}</span>
                      <span className={typeof asset.change === "number" && asset.change < 0 ? "text-xs text-loss" : "text-xs text-gain"}>{formatPercent(asset.change)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{asset.name ?? "Unavailable"}</p>
                  </button>
                );
              })}
            </div>
            <StatusBadge label={selected?.status} real={selected?.real_data} />
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">Updated</p><p className="mt-1 text-sm text-slate-200">{selected?.latest_date ? formatDate(selected.latest_date) : "Unavailable"}</p></div>
            <div className="rounded border border-line bg-ink p-3"><p className="text-xs text-slate-500">History rows</p><p className="mt-1 text-sm text-slate-200">{selectedHistory?.rows?.length ?? 0}</p></div>
            {selected?.symbol ? <Link href={assetHref(selected.symbol)} className="inline-flex rounded border border-line px-3 py-2 text-sm text-slate-200 hover:bg-ink hover:text-white">{t("openDetail")}</Link> : null}
          </div>
        </Panel>
      </div>
      <div className="mt-4">
        <Panel>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{group === "All" ? "Asset browser" : group}</h2>
              <p className="mt-1 text-xs text-slate-500">{visibleAssets.length} assets · local generated/mock data</p>
            </div>
            <div className="rounded border border-line bg-ink p-1">
              {(["cards", "table"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={`rounded px-3 py-1.5 text-xs font-medium ${view === item ? "bg-cyan-400/15 text-cyan-200" : "text-slate-400 hover:text-white"}`}
                >
                  {item === "cards" ? t("cards") : t("table")}
                </button>
              ))}
            </div>
          </div>
          {view === "cards" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {visibleAssets.map((asset, index) => {
                const active = asset.symbol === selected?.symbol;
                return (
                  <div
                    key={`${asset.symbol}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => chooseAsset(asset.symbol)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        chooseAsset(asset.symbol);
                      }
                    }}
                    className={`group rounded-lg border p-1 text-left transition ${active ? "border-cyan-400/50 bg-cyan-400/5" : "border-transparent hover:border-line"}`}
                  >
                    <div className="relative">
                      {asset.symbol ? <PinButton target={{ type: "asset", id: asset.symbol }} defaultPins={defaultPins} className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100" /> : null}
                      <AssetCard asset={asset} history={history.symbols?.[asset.symbol ?? ""]} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="py-2">Symbol</th><th>Name</th><th>Group</th><th>Latest</th><th>Change</th><th>Updated</th><th>Data</th><th>Trend</th><th></th></tr>
                </thead>
                <tbody>
                  {visibleAssets.map((asset) => {
                    const active = asset.symbol === selected?.symbol;
                    return (
                      <tr key={asset.symbol} className={`border-t border-line ${active ? "bg-cyan-400/5" : ""}`}>
                        <td className="py-3 font-medium text-white"><Link href={assetHref(asset.symbol ?? "")} className="hover:text-cyan-300">{asset.symbol ?? "N/A"}</Link></td>
                        <td className="text-slate-300">{asset.name ?? "Unavailable"}</td>
                        <td className="text-slate-500">{asset.group ?? "N/A"}</td>
                        <td>{formatValueWithUnit(asset.value, asset.unit)}</td>
                        <td className={typeof asset.change === "number" && asset.change < 0 ? "text-loss" : "text-gain"}>{formatPercent(asset.change)}</td>
                        <td className="text-slate-400">{asset.latest_date ? formatDate(asset.latest_date) : "N/A"}</td>
                        <td><StatusBadge label={asset.status} real={asset.real_data} /></td>
                        <td className="w-32"><Sparkline rows={history.symbols?.[asset.symbol ?? ""]?.rows} positive={(asset.change ?? 0) >= 0} /></td>
                        <td><button type="button" onClick={() => chooseAsset(asset.symbol)} className="rounded border border-line px-2 py-1 text-xs text-slate-300 hover:bg-panel hover:text-white">{active ? "Selected" : "Select"}</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
