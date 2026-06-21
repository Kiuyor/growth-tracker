import { describe, it, expect } from "vitest";
import {
  buildEmptyBuckets,
  mergeRecordsIntoBuckets,
  buildDailyBuckets,
  type DailyBucket,
} from "@/lib/aggregations";

describe("buildEmptyBuckets", () => {
  it("returns correct number of days", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2026-01-07");
    const buckets = buildEmptyBuckets(start, end);
    expect(buckets).toHaveLength(7);
  });

  it("single day range returns one bucket", () => {
    const d = new Date("2026-01-01");
    const buckets = buildEmptyBuckets(d, d);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].date).toBe("2026-01-01");
  });

  it("all buckets initialize with zero values", () => {
    const buckets = buildEmptyBuckets(
      new Date("2026-01-01"),
      new Date("2026-01-03")
    );
    buckets.forEach((b: DailyBucket) => {
      expect(b.checkIn).toBe(false);
      expect(b.pomodoroCount).toBe(0);
      expect(b.pomodoroMinutes).toBe(0);
      expect(b.moodScore).toBeNull();
      expect(b.tasksCompleted).toBe(0);
      expect(b.pointsEarned).toBe(0);
      expect(b.streak).toBe(0);
    });
  });
});

describe("mergeRecordsIntoBuckets", () => {
  it("merges checkIn records", () => {
    const buckets = buildEmptyBuckets(
      new Date("2026-01-01"),
      new Date("2026-01-03")
    );
    mergeRecordsIntoBuckets(buckets, [
      { date: new Date("2026-01-01"), checkIn: true },
      { date: new Date("2026-01-02"), checkIn: true },
    ]);
    expect(buckets[0].checkIn).toBe(true);
    expect(buckets[1].checkIn).toBe(true);
    expect(buckets[2].checkIn).toBe(false);
  });

  it("accumulates pomodoro counts and minutes", () => {
    const buckets = buildEmptyBuckets(
      new Date("2026-01-01"),
      new Date("2026-01-01")
    );
    mergeRecordsIntoBuckets(buckets, [
      { date: new Date("2026-01-01"), pomodoroCount: 1, pomodoroMinutes: 25 },
      { date: new Date("2026-01-01"), pomodoroCount: 2, pomodoroMinutes: 50 },
    ]);
    expect(buckets[0].pomodoroCount).toBe(3);
    expect(buckets[0].pomodoroMinutes).toBe(75);
  });

  it("averages moodScore from multiple records", () => {
    const buckets = buildEmptyBuckets(
      new Date("2026-01-01"),
      new Date("2026-01-01")
    );
    mergeRecordsIntoBuckets(buckets, [
      { date: new Date("2026-01-01"), moodScore: 4 },
      { date: new Date("2026-01-01"), moodScore: 2 },
    ]);
    expect(buckets[0].moodScore).toBe(3.0);
  });

  it("sets streaks", () => {
    const buckets = buildEmptyBuckets(
      new Date("2026-01-01"),
      new Date("2026-01-01")
    );
    mergeRecordsIntoBuckets(buckets, [
      { date: new Date("2026-01-01"), checkIn: true, streak: 7 },
    ]);
    expect(buckets[0].streak).toBe(7);
    expect(buckets[0].checkIn).toBe(true);
  });

  it("ignores records outside bucket range", () => {
    const buckets = buildEmptyBuckets(
      new Date("2026-01-01"),
      new Date("2026-01-01")
    );
    mergeRecordsIntoBuckets(buckets, [
      { date: new Date("2026-01-02"), checkIn: true },
    ]);
    expect(buckets[0].checkIn).toBe(false);
  });

  it("accepts string dates", () => {
    const buckets = buildEmptyBuckets(
      new Date("2026-01-01"),
      new Date("2026-01-01")
    );
    mergeRecordsIntoBuckets(buckets, [
      { date: "2026-01-01", checkIn: true },
    ]);
    expect(buckets[0].checkIn).toBe(true);
  });
});

describe("buildDailyBuckets", () => {
  it("combines empty bucket creation and merge", () => {
    const result = buildDailyBuckets(
      new Date("2026-01-01"),
      new Date("2026-01-03"),
      [
        { date: new Date("2026-01-01"), checkIn: true },
        { date: new Date("2026-01-02"), tasksCompleted: 3 },
      ]
    );
    expect(result).toHaveLength(3);
    expect(result[0].checkIn).toBe(true);
    expect(result[1].tasksCompleted).toBe(3);
  });
});
