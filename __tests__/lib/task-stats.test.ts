import { describe, it, expect } from "vitest";
import {
  buildTaskStatusCounts,
  buildTaskPriorityCounts,
  buildTaskCategoryCounts,
} from "@/lib/task-stats";

describe("buildTaskStatusCounts", () => {
  it("counts from groupBy result", () => {
    const counts = buildTaskStatusCounts([
      { status: "TODO", _count: { status: 5 } },
      { status: "IN_PROGRESS", _count: { status: 3 } },
      { status: "DONE", _count: { status: 10 } },
    ]);
    expect(counts.TODO).toBe(5);
    expect(counts.IN_PROGRESS).toBe(3);
    expect(counts.DONE).toBe(10);
    expect(counts.total).toBe(18);
  });

  it("handles empty input", () => {
    const counts = buildTaskStatusCounts([]);
    expect(counts.TODO).toBe(0);
    expect(counts.IN_PROGRESS).toBe(0);
    expect(counts.DONE).toBe(0);
    expect(counts.total).toBe(0);
  });

  it("ignores unknown status values", () => {
    const counts = buildTaskStatusCounts([
      { status: "ARCHIVED" as string, _count: { status: 2 } },
      { status: "TODO", _count: { status: 1 } },
    ]);
    expect(counts.TODO).toBe(1);
    expect(counts.total).toBe(1);
  });
});

describe("buildTaskPriorityCounts", () => {
  it("maps priority groups", () => {
    const result = buildTaskPriorityCounts([
      { priority: "HIGH", _count: { priority: 3 } },
      { priority: "MEDIUM", _count: { priority: 7 } },
    ]);
    expect(result).toEqual([
      { priority: "HIGH", count: 3 },
      { priority: "MEDIUM", count: 7 },
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(buildTaskPriorityCounts([])).toEqual([]);
  });
});

describe("buildTaskCategoryCounts", () => {
  it("filters null categories and maps counts", () => {
    const result = buildTaskCategoryCounts([
      { category: "学习", _count: { category: 4 } },
      { category: null, _count: { category: 1 } },
      { category: "运动", _count: { category: 2 } },
    ]);
    expect(result).toEqual([
      { category: "学习", count: 4 },
      { category: "运动", count: 2 },
    ]);
  });

  it("returns empty array when all categories are null", () => {
    const result = buildTaskCategoryCounts([
      { category: null, _count: { category: 5 } },
    ]);
    expect(result).toEqual([]);
  });
});
