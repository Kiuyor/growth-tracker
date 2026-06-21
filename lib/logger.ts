type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  };

  if (process.env.NODE_ENV === "production") {
    // 生产环境：未来可接 Sentry / Axiom 等外部日志服务
    // 当前使用结构化 JSON 输出，便于日志采集系统解析
    const output = JSON.stringify(entry);
    if (level === "error") console.error(output);
    else if (level === "warn") console.warn(output);
    else console.log(output);
  } else {
    // 开发环境：可读性优先
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    if (level === "error") console.error(prefix, message, context || "");
    else if (level === "warn") console.warn(prefix, message, context || "");
    else console.log(prefix, message, context || "");
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    log("warn", message, context),
  error: (message: string, err?: unknown) =>
    log("error", message, {
      error: err instanceof Error ? err.message : String(err ?? ""),
      stack: err instanceof Error ? err.stack : undefined,
    }),
};
