export function assetHref(symbol: string) {
  return `/assets/${encodeURIComponent(symbol)}`;
}

export function indicatorHref(id: string) {
  return `/indicators/${encodeURIComponent(id)}`;
}
