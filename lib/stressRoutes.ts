export const STRESS_BUCKET_ORDER = [
  "volatility",
  "credit",
  "liquidity",
  "treasury",
  "banking",
  "household",
  "leverage",
];

const labels: Record<string, string> = {
  volatility: "Volatility",
  credit: "Credit",
  liquidity: "Liquidity",
  treasury: "Treasury",
  banking: "Banking",
  household: "Household",
  leverage: "Leverage",
};

export function stressBucketHref(id: string) {
  return `/stress/${encodeURIComponent(id)}`;
}

export function stressBucketTitle(id: string) {
  const normalized = id.toLowerCase();
  return labels[normalized] ?? normalized.split(/[-_\s]+/u).filter(Boolean).map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}
