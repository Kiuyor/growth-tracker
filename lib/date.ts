import { format } from "date-fns";

/**
 * 返回本地时区下 yyyy-MM-dd 形式的日期键。
 * 避免使用 toISOString().split("T")[0]，因为它基于 UTC，
 * 对 UTC+8 用户在 00:00-08:00 之间会产生前一天日期。
 */
export function dayKey(d: Date | string): string {
  return format(d, "yyyy-MM-dd");
}
