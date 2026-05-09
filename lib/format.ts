const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function numeric(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function tidy(value: string) {
  return value.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

export function formatNumber(value: number | string | null | undefined, maximumFractionDigits = 2) {
  const number = numeric(value);
  if (number === null) return "Unavailable";
  return tidy(number.toLocaleString("en-US", { maximumFractionDigits }));
}

export function formatCompact(value: number | string | null | undefined, maximumFractionDigits = 2) {
  const number = numeric(value);
  if (number === null) return "Unavailable";
  return tidy(
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits,
    }).format(number),
  );
}

export function formatPercent(value: number | string | null | undefined, maximumFractionDigits = 2) {
  const number = numeric(value);
  if (number === null) return "Unavailable";
  return `${number > 0 ? "+" : ""}${formatNumber(number, maximumFractionDigits)}%`;
}

export function formatRate(value: number | string | null | undefined, maximumFractionDigits = 2) {
  const number = numeric(value);
  if (number === null) return "Unavailable";
  return `${formatNumber(number, maximumFractionDigits)}%`;
}

export function formatDelta(value: number | string | null | undefined, unit = "", maximumFractionDigits = 2) {
  const number = numeric(value);
  if (number === null) return "Unavailable";
  const sign = number > 0 ? "+" : "";
  const cleanUnit = unit.trim();
  const displayUnit = cleanUnit === "%" ? "pp" : cleanUnit;
  const suffix = displayUnit ? ` ${displayUnit}` : "";
  return `${sign}${formatNumber(number, maximumFractionDigits)}${suffix}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateTimeFormatter.format(date);
}

export function formatLargeMacroValue(value: number | string | null | undefined, unit?: string | null) {
  const number = numeric(value);
  if (number === null) return "Unavailable";
  const cleanUnit = (unit ?? "").trim();
  if (/usd millions/i.test(cleanUnit)) return `${formatCompact(number * 1_000_000)} USD`;
  if (/usd billions/i.test(cleanUnit)) return `${formatCompact(number * 1_000_000_000)} USD`;
  if (/millions/i.test(cleanUnit)) return formatCompact(number * 1_000_000);
  if (/billions/i.test(cleanUnit)) return formatCompact(number * 1_000_000_000);
  if (Math.abs(number) >= 1_000_000) return formatCompact(number);
  return formatNumber(number, Math.abs(number) < 10 ? 3 : 2);
}

export function formatValueWithUnit(value: number | string | null | undefined, unit?: string | null) {
  const cleanUnit = (unit ?? "").trim();
  if (!cleanUnit) return formatNumber(value, 2);
  if (cleanUnit === "%") return formatRate(value);
  if (cleanUnit === "pp") return `${formatNumber(value, 2)} pp`;
  if (/percent|rate|spread|yield/i.test(cleanUnit)) return `${formatNumber(value, 2)} ${cleanUnit}`;
  if (/usd|millions|billions/i.test(cleanUnit)) return formatLargeMacroValue(value, cleanUnit);
  return `${formatNumber(value, 3)} ${cleanUnit}`;
}
