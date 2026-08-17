import { Link } from 'react-router-dom'

// Same stat-tile shape as ResponseRateTile, but clickable — links straight to the Table filtered
// to the companies that make up the count, since a bare number doesn't answer "which ones".
export function InterviewedCountTile({ interviewedCount }: { interviewedCount: number }) {
  return (
    <Link
      to="/app/table?interviewed=1"
      className="block rounded-[10px] border border-ink/10 p-4 transition hover:border-ink/25"
    >
      <p className="text-xs font-medium text-ink/50">Companies interviewed</p>
      <p className="mt-1 text-3xl font-semibold text-ink">{interviewedCount}</p>
      <p className="mt-1 text-xs text-ink/40">
        {interviewedCount === 0 ? 'None yet' : 'Includes ones that later said no — view list'}
      </p>
    </Link>
  )
}
