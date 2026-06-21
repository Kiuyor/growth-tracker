import { format, eachDayOfInterval } from "date-fns";

export interface RawDailyRecord {
  date: Date | string;
  checkIn?: boolean;
  streak?: number;
  pomodoroCount?: number;
  pomodoroMinutes?: number;
  moodScore?: number | null;
  tasksCompleted?: number;
  pointsEarned?: number;
}

export interface DailyBucket {
  date: string;
  checkIn: boolean;
  pomodoroCount: number;
  pomodoroMinutes: number;
  moodScore: number | null;
  tasksCompleted: number;
  pointsEarned: number;
  streak: number;
}

function toDateKey(d: Date | string): string {
  if (typeof d === "string") return d;
  return format(d, "yyyy-MM-dd");
}

export function buildEmptyBuckets(start: Date, end: Date): DailyBucket[] {
  const days = eachDayOfInterval({ start, end });
  return days.map((d) => ({
    date: toDateKey(d),
    checkIn: false,
    pomodoroCount: 0,
    pomodoroMinutes: 0,
    moodScore: null,
    tasksCompleted: 0,
    pointsEarned: 0,
    streak: 0,
  }));
}

export function mergeRecordsIntoBuckets(
  buckets: DailyBucket[],
  records: RawDailyRecord[]
): void {
  const bucketMap = new Map(buckets.map((b) => [b.date, b]));

  for (const record of records) {
    const key = toDateKey(record.date);
    const bucket = bucketMap.get(key);
    if (!bucket) continue;

    if (record.checkIn) {
      bucket.checkIn = true;
    }
    if (record.streak !== undefined) {
      bucket.streak = record.streak;
    }
    if (record.pomodoroCount) {
      bucket.pomodoroCount += record.pomodoroCount;
    }
    if (record.pomodoroMinutes) {
      bucket.pomodoroMinutes += record.pomodoroMinutes;
    }
    if (record.moodScore !== undefined && record.moodScore !== null) {
      if (bucket.moodScore === null) {
        bucket.moodScore = record.moodScore;
      } else {
        bucket.moodScore = Number(
          ((bucket.moodScore + record.moodScore) / 2).toFixed(1)
        );
      }
    }
    if (record.tasksCompleted) {
      bucket.tasksCompleted += record.tasksCompleted;
    }
    if (record.pointsEarned) {
      bucket.pointsEarned += record.pointsEarned;
    }
  }
}

export function buildDailyBuckets(
  start: Date,
  end: Date,
  records: RawDailyRecord[]
): DailyBucket[] {
  const buckets = buildEmptyBuckets(start, end);
  mergeRecordsIntoBuckets(buckets, records);
  return buckets;
}
