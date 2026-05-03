"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDate, formatPercent, formatValueWithUnit } from "@/lib/format";
import type { PinConfig, ResolvedResearchItem } from "@/lib/types";
import { StatusBadge } from "./Cockpit";
import { useLanguage } from "./LanguageProvider";

const storageKey = "macro-watch:pins:v1";

function keyFor(pin: PinConfig) {
  return `${pin.type}:${pin.id}`;
}

function readPins(defaultPins: PinConfig[]) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultPins;
    const parsed = JSON.parse(raw) as PinConfig[];
    return Array.isArray(parsed) ? parsed.filter((pin) => pin?.type && pin?.id) : defaultPins;
  } catch {
    return defaultPins;
  }
}

function savePins(pins: PinConfig[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(pins));
  window.dispatchEvent(new Event("macro-watch:pins-changed"));
}

export function PinButton({
  target,
  defaultPins = [],
  className = "",
}: {
  target: PinConfig;
  defaultPins?: PinConfig[];
  className?: string;
}) {
  const { t } = useLanguage();
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const sync = () => {
      const pins = readPins(defaultPins);
      setPinned(pins.some((pin) => keyFor(pin) === keyFor(target)));
    };
    sync();
    window.addEventListener("macro-watch:pins-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("macro-watch:pins-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [defaultPins, target.id, target.type]);

  return (
    <button
      type="button"
      title={pinned ? t("removePin") : t("addPin")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const pins = readPins(defaultPins);
        const exists = pins.some((pin) => keyFor(pin) === keyFor(target));
        const next = exists ? pins.filter((pin) => keyFor(pin) !== keyFor(target)) : [...pins, target];
        savePins(next);
        setPinned(!exists);
      }}
      className={`inline-flex h-7 w-7 items-center justify-center rounded border border-line bg-ink text-sm text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-200 ${pinned ? "border-cyan-400/30 text-cyan-200" : ""} ${className}`}
    >
      {pinned ? "−" : "+"}
    </button>
  );
}

export function PinnedWorkbench({
  defaultPins,
  items,
}: {
  defaultPins: PinConfig[];
  items: ResolvedResearchItem[];
}) {
  const { t } = useLanguage();
  const [pins, setPins] = useState(defaultPins);
  const itemMap = useMemo(() => new Map(items.map((item) => [`${item.type}:${item.id}`, item])), [items]);
  const pinnedItems = pins.map((pin) => itemMap.get(keyFor(pin))).filter((item): item is ResolvedResearchItem => Boolean(item));
  const availableItems = items.filter((item) => !pins.some((pin) => keyFor(pin) === `${item.type}:${item.id}`));

  useEffect(() => {
    const sync = () => setPins(readPins(defaultPins));
    sync();
    window.addEventListener("macro-watch:pins-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("macro-watch:pins-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [defaultPins]);

  const remove = (target: PinConfig) => {
    const next = pins.filter((pin) => keyFor(pin) !== keyFor(target));
    setPins(next);
    savePins(next);
  };

  const add = (encoded: string) => {
    const item = items.find((candidate) => `${candidate.type}:${candidate.id}` === encoded);
    if (!item) return;
    const next = [...pins, { type: item.type, id: item.id }];
    setPins(next);
    savePins(next);
  };

  return (
    <section className="rounded-lg border border-line bg-panel p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{t("pinnedIndicators")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("contextOnly")} · {t("notScored")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label={t("addPin")}
            defaultValue=""
            onChange={(event) => {
              add(event.currentTarget.value);
              event.currentTarget.value = "";
            }}
            className="rounded border border-line bg-ink px-3 py-2 text-xs text-slate-300"
          >
            <option value="">{t("addPin")}</option>
            {availableItems.map((item) => (
              <option key={`${item.type}-${item.id}`} value={`${item.type}:${item.id}`}>{item.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => { setPins(defaultPins); savePins(defaultPins); }} className="rounded border border-line px-3 py-2 text-xs text-slate-300 hover:bg-ink hover:text-white">
            {t("resetPins")}
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(pinnedItems.length ? pinnedItems : []).map((pin) => (
          <Link key={`${pin.type}-${pin.id}`} href={pin.href} className="group relative rounded-lg border border-line bg-ink p-4 transition hover:border-cyan-400/40 hover:bg-[#0c1018]">
            <button
              type="button"
              aria-label={t("removePin")}
              onClick={(event) => {
                event.preventDefault();
                remove({ type: pin.type, id: pin.id });
              }}
              className="absolute right-2 top-2 hidden h-7 w-7 rounded border border-line bg-panel text-slate-400 hover:text-white group-hover:block"
            >
              ×
            </button>
            <div className="flex items-start justify-between gap-3 pr-7">
              <p className="text-xs uppercase tracking-wide text-slate-500">{pin.label}</p>
              <StatusBadge label={pin.status} real={pin.real_data} />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{formatValueWithUnit(pin.value, pin.unit)}</p>
            <p className="mt-2 text-xs text-slate-400">
              {pin.type === "asset" ? pin.delta_label ?? "context only" : pin.delta_label ?? "Δ previous unavailable"}
            </p>
            <p className="mt-2 text-xs text-slate-500">{pin.latest_date ? formatDate(pin.latest_date) : t("unavailable")}</p>
          </Link>
        ))}
        {!pinnedItems.length ? <p className="text-sm text-slate-500">{t("noPinnedItems")}</p> : null}
      </div>
    </section>
  );
}
