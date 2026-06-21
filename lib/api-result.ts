export interface ApiError {
  error: string;
}

export type ApiResult<T> = T | ApiError;

export function isApiError(data: unknown): data is ApiError {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as ApiError).error === "string"
  );
}

export function getApiError(data: unknown, fallback = "请求失败"): string {
  if (isApiError(data)) return data.error;
  return fallback;
}
