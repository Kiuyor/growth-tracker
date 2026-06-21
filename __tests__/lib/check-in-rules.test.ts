import { describe, it, expect } from "vitest";
import {
  STREAK_MILESTONES,
  getMilestoneBonus,
  getNextMilestone,
} from "@/lib/check-in-rules";

describe("STREAK_MILESTONES", () => {
  it("is sorted by days ascending", () => {
    for (let i = 1; i < STREAK_MILESTONES.length; i++) {
      expect(STREAK_MILESTONES[i].days).toBeGreaterThan(
        STREAK_MILESTONES[i - 1].days
      );
    }
  });

  it("has exactly 6 milestones", () => {
    expect(STREAK_MILESTONES).toHaveLength(6);
  });

  it("each milestone has positive bonus and non-empty label", () => {
    STREAK_MILESTONES.forEach((m) => {
      expect(m.bonus).toBeGreaterThan(0);
      expect(m.label.length).toBeGreaterThan(0);
    });
  });
});

describe("getMilestoneBonus", () => {
  it("returns milestone rule when streak matches exactly", () => {
    const result = getMilestoneBonus(7);
    expect(result).toEqual({ days: 7, bonus: 15, label: "连续 7 天" });
  });

  it("returns first milestone for streak 3", () => {
    const result = getMilestoneBonus(3);
    expect(result).toEqual({ days: 3, bonus: 5, label: "连续 3 天" });
  });

  it("returns last milestone for streak 100", () => {
    const result = getMilestoneBonus(100);
    expect(result).toEqual({ days: 100, bonus: 500, label: "连续 100 天" });
  });

  it("returns null when no milestone matches", () => {
    expect(getMilestoneBonus(1)).toBeNull();
    expect(getMilestoneBonus(5)).toBeNull();
    expect(getMilestoneBonus(101)).toBeNull();
    expect(getMilestoneBonus(0)).toBeNull();
  });
});

describe("getNextMilestone", () => {
  it("returns first milestone greater than current streak", () => {
    expect(getNextMilestone(0)).toEqual({
      days: 3,
      bonus: 5,
      label: "连续 3 天",
    });
    expect(getNextMilestone(2)).toEqual({
      days: 3,
      bonus: 5,
      label: "连续 3 天",
    });
  });

  it("returns next tier when streak is between milestones", () => {
    expect(getNextMilestone(5)?.days).toBe(7);
    expect(getNextMilestone(10)?.days).toBe(14);
  });

  it("returns null when streak exceeds all milestones", () => {
    expect(getNextMilestone(100)).toBeNull();
    expect(getNextMilestone(200)).toBeNull();
  });
});
