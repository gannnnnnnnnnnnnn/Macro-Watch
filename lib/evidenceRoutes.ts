import assetsConfig from "@/config/assets.json";
import indicatorsConfig from "@/config/indicators.json";
import { STRESS_BUCKET_ORDER } from "./stressRoutes";
import type { IndicatorConfig } from "./types";

export function evidenceHref(id: string) {
  return `/library/${encodeURIComponent(id)}`;
}

export function sourceHref(sourceId: string, sourceType?: string) {
  const normalizedType = sourceType?.toLowerCase();
  if (normalizedType === "asset") return `/assets/${encodeURIComponent(sourceId)}`;
  if (normalizedType === "indicator" || normalizedType === "derived") return `/indicators/${encodeURIComponent(sourceId)}`;
  if (normalizedType === "stress" && STRESS_BUCKET_ORDER.includes(sourceId.toLowerCase())) return `/stress/${encodeURIComponent(sourceId.toLowerCase())}`;

  const asset = (assetsConfig.assets ?? []).find((item) => item.symbol?.toLowerCase() === sourceId.toLowerCase());
  if (asset?.symbol) return `/assets/${encodeURIComponent(asset.symbol)}`;

  const indicators = [...(indicatorsConfig.indicators ?? []), ...(indicatorsConfig.derived ?? [])] as IndicatorConfig[];
  const indicator = indicators.find((item) => [item.id, item.series_id, item.label].some((value) => value?.toLowerCase() === sourceId.toLowerCase()));
  if (indicator?.id) return `/indicators/${encodeURIComponent(indicator.id)}`;

  if (STRESS_BUCKET_ORDER.includes(sourceId.toLowerCase())) return `/stress/${encodeURIComponent(sourceId.toLowerCase())}`;
  return sourceId ? `/library?source=${encodeURIComponent(sourceId)}` : "/library";
}
