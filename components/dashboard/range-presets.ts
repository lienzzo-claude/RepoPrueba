import { toIsoDate } from "@/lib/format";

export type RangePreset = "month" | "year" | "all" | "30d" | "7d";

export function getRange(preset: RangePreset): { from?: string; to?: string } {
  const now = new Date();
  const today = toIsoDate(now);
  if (preset === "all") return {};
  if (preset === "month") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toIsoDate(first), to: today };
  }
  if (preset === "year") {
    const first = new Date(now.getFullYear(), 0, 1);
    return { from: toIsoDate(first), to: today };
  }
  if (preset === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    return { from: toIsoDate(d), to: today };
  }
  if (preset === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    return { from: toIsoDate(d), to: today };
  }
  return {};
}

export const PRESET_LABELS: Record<RangePreset, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  month: "Este mes",
  year: "Este año",
  all: "Todo",
};
