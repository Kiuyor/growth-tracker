/**
 * 通用客户端 fetch 封装。
 * - 统一处理 JSON 解析和错误状态码
 * - 统一捕获网络异常
 * - 返回 { data, error, ok } 三元组
 */

export interface FetchResult<T = unknown> {
  data?: T;
  error?: string;
  ok: boolean;
}

export async function fetchApi<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<FetchResult<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "请求失败", ok: false };
    }
    return { data, ok: true };
  } catch {
    return { error: "网络连接失败", ok: false };
  }
}
