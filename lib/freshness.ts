export function getFreshness(generatedAt?: string | null) {
  if (!generatedAt) {
    return { hasGenerated: false, isStale: true, ageHours: null as number | null, label: "Run pipeline" };
  }
  const timestamp = Date.parse(generatedAt);
  if (Number.isNaN(timestamp)) {
    return { hasGenerated: true, isStale: true, ageHours: null as number | null, label: "Timestamp invalid" };
  }
  const ageHours = Math.max(0, (Date.now() - timestamp) / 36e5);
  return {
    hasGenerated: true,
    isStale: ageHours > 24,
    ageHours,
    label: ageHours > 24 ? `Stale: ${Math.round(ageHours)}h old` : `Fresh: ${Math.round(ageHours)}h old`,
  };
}
