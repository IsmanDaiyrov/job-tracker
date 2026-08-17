// Stat tile: label (sentence case, no colon), value (semibold, proportional figures — this is
// a display-sized number, not a table column, so no tabular-nums), supporting line for context.
export function ResponseRateTile({
  respondedCount,
  appliedCount,
  responseRate,
}: {
  respondedCount: number
  appliedCount: number
  responseRate: number | null
}) {
  return (
    <div className="rounded-[10px] border border-ink/10 p-4">
      <p className="text-xs font-medium text-ink/50">Response rate</p>
      <p className="mt-1 text-3xl font-semibold text-ink">
        {responseRate === null ? '—' : `${Math.round(responseRate * 100)}%`}
      </p>
      <p className="mt-1 text-xs text-ink/40">
        {appliedCount === 0 ? 'No applications yet' : `${respondedCount} of ${appliedCount} applications`}
      </p>
    </div>
  )
}
