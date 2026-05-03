import fs from "fs";
import path from "path";
import type { MacroIndicators, MarketHistory, MarketSnapshot, PipelineStatus, SourceName, StressIndicators } from "./types";

const root = process.cwd();

function readJson<T>(folder: "generated" | "mock", file: string): T | null {
  try {
    const fullPath = path.join(root, "data", folder, file);
    if (!fs.existsSync(fullPath)) return null;
    const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8")) as T;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function hasArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function hasGroups(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && Object.values(value).some(hasArray));
}

function choose<T>(file: string, complete: (value: T) => boolean): { data: T; source: SourceName } {
  const generated = readJson<T>("generated", file);
  if (generated && complete(generated)) return { data: generated, source: "generated" };
  const mock = readJson<T>("mock", file);
  if (mock) return { data: mock, source: "mock" };
  return { data: {} as T, source: "mock" };
}

export function getCockpitData() {
  const market = choose<MarketSnapshot>("market_snapshot.json", (d) => hasArray(d.assets));
  const marketHistory = choose<MarketHistory>("market_history.json", (d) => Boolean(d.symbols && Object.values(d.symbols).some((item) => hasArray(item.rows))));
  const macro = choose<MacroIndicators>("macro_indicators.json", (d) => hasGroups(d.groups));
  const stress = choose<StressIndicators>("stress_indicators.json", (d) => hasGroups(d.buckets));
  const pipelineStatus = readJson<PipelineStatus>("generated", "pipeline_status.json") ?? {
    source: "mock",
    status: "No generated pipeline status found",
    warnings: ["Run the local pipeline to create generated data."],
    providers: [],
  };
  const sources = [market.source, marketHistory.source, macro.source, stress.source];
  const source: SourceName = sources.every((s) => s === "generated")
    ? "generated"
    : sources.every((s) => s === "mock")
      ? "mock"
      : "mixed";

  return { market: market.data, marketHistory: marketHistory.data, macro: macro.data, stress: stress.data, pipelineStatus, source };
}
