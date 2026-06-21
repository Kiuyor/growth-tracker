import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * 包装 API handler，统一处理 Clerk 鉴权和错误捕获。
 * 若未登录返回 401；若 handler 抛异常返回 500 JSON；
 * 正常时注入 userId 并执行 handler。
 */
export function withAuth<T = { params: Promise<Record<string, string>> }>(
  handler: (userId: string, request: Request, context: T) => Promise<Response>
) {
  return async (request: Request, context: T): Promise<Response> => {
    try {
      const session = await auth();
      if (!session.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return await handler(session.userId, request, context);
    } catch (error) {
      logger.error("API handler error", error);
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
