import { InterviewedCountTile } from '../components/dashboard/InterviewedCountTile'
import { ResponseRateTile } from '../components/dashboard/ResponseRateTile'
import { StatusBreakdownChart } from '../components/dashboard/StatusBreakdownChart'
import { TimeInStageChart } from '../components/dashboard/TimeInStageChart'
import { useStatsQuery } from '../hooks/useStats'

// The /app/dashboard page: a snapshot of the current user's applications — status breakdown,
// response rate, and average time spent in each stage. All three come from one aggregate
// endpoint (GET /stats/overview) rather than being computed client-side from the full
// applications list, so the numbers stay correct even as the list grows.
export function DashboardPage() {
  const { data: stats, isLoading } = useStatsQuery()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-ink/50">A snapshot of your job search.</p>
      </div>

      {isLoading || !stats ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : (
        <div className="max-w-3xl space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <ResponseRateTile
              respondedCount={stats.responded_count}
              appliedCount={stats.applied_count}
              responseRate={stats.response_rate}
            />
            <InterviewedCountTile interviewedCount={stats.interviewed_count} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[10px] border border-ink/10 p-4">
              <StatusBreakdownChart data={stats.status_breakdown} />
            </div>
            <div className="rounded-[10px] border border-ink/10 p-4">
              <TimeInStageChart data={stats.time_in_stage} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
