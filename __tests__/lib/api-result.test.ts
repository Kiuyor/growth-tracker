import { describe, it, expect } from "vitest";
import { isApiError, getApiError } from "@/lib/api-result";

describe("isApiError", () => {
  it("returns true for objects with an 'error' string property", () => {
    expect(isApiError({ error: "something went wrong" })).toBe(true);
  });

  it("returns false for objects without an 'error' property", () => {
    expect(isApiError({ data: "ok" })).toBe(false);
  });

  it("returns false for objects where 'error' is not a string", () => {
    expect(isApiError({ error: 123 })).toBe(false);
    expect(isApiError({ error: true })).toBe(false);
  });

  it("returns false for null", () => {
    expect(isApiError(null)).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(isApiError("error")).toBe(false);
    expect(isApiError(123)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
  });

  it("returns false for empty objects", () => {
    expect(isApiError({})).toBe(false);
  });
});

describe("getApiError", () => {
  it("extracts error message from ApiError object", () => {
    expect(getApiError({ error: "Not found" })).toBe("Not found");
  });

  it("returns fallback for non-ApiError data", () => {
    expect(getApiError({ data: "ok" })).toBe("请求失败");
  });

  it("returns custom fallback when provided", () => {
    expect(getApiError(null, "Network error")).toBe("Network error");
  });

  it("returns fallback for null/undefined", () => {
    expect(getApiError(null)).toBe("请求失败");
    expect(getApiError(undefined)).toBe("请求失败");
  });
});
