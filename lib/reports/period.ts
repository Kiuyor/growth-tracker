import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  format,
  getISOWeek,
} from "date-fns";
import { zhCN } from "date-fns/locale";

export function getPeriod(
  type: "weekly" | "monthly",
  offset: number,
  anchor: Date = new Date()
) {
  const currentAnchor =
    type === "weekly" ? addWeeks(anchor, offset) : addMonths(anchor, offset);

  const start =
    type === "weekly"
      ? startOfWeek(currentAnchor, { weekStartsOn: 1 })
      : startOfMonth(currentAnchor);

  const end =
    type === "weekly"
      ? endOfWeek(currentAnchor, { weekStartsOn: 1 })
      : endOfMonth(currentAnchor);

  let label: string;
  if (type === "weekly") {
    const weekNum = getISOWeek(start);
    label = `${format(start, "yyyy年")}第${weekNum}周 (${format(start, "MM.dd")}-${format(end, "MM.dd")})`;
  } else {
    label = format(start, "yyyy年M月", { locale: zhCN });
  }

  return { start, end, label };
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}
