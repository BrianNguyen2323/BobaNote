import { bucketName, type Period } from "../../lib/stats";

type Bucket = { key: string; label: string; count: number };

// Month view has up to 31 bars, so only some day numbers get a visible label.
function showLabel(period: Period, bucket: Bucket): boolean {
  if (period !== "month") {
    return true;
  }
  const day = Number(bucket.key.slice(8));
  return day === 1 || day % 5 === 0;
}

export function BarChart({ buckets, period, today }: { buckets: Bucket[]; period: Period; today: string }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const currentKey = period === "year" ? today.slice(0, 7) : today;
  const gap = period === "month" ? "gap-0.5" : "gap-1.5";
  return (
    <div className={`flex h-44 items-stretch ${gap}`}>
      {buckets.map((bucket) => (
        <div
          key={bucket.key}
          role="img"
          aria-label={`${bucketName(bucket.key)}: ${bucket.count} ${bucket.count === 1 ? "drink" : "drinks"}`}
          className="flex min-w-0 flex-1 flex-col items-center justify-end"
        >
          <span className="h-4 text-xs font-semibold text-ink-muted" aria-hidden>
            {period !== "month" && bucket.count > 0 ? bucket.count : ""}
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className={`w-full rounded-full ${bucket.key === currentKey ? "bg-accent" : "bg-accent/40"}`}
              style={{ height: bucket.count === 0 ? "0.25rem" : `${(bucket.count / max) * 100}%` }}
            />
          </div>
          <span
            className={`mt-1 h-4 text-xs ${bucket.key === currentKey ? "font-bold text-accent-ink" : "text-ink-muted"}`}
            aria-hidden
          >
            {showLabel(period, bucket) ? bucket.label : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
