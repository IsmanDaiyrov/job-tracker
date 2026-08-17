import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { STATUS_LABELS } from '../../types/application'
import type { StageDuration } from '../../types/stats'
import { STATUS_CHART_COLORS, STATUS_ORDER } from '../../lib/statusPalette'

// Horizontal bar chart: average days spent in each status's *current* stage. Unlike the status
// breakdown, a status you've never had says nothing ("0 days" would misread as "resolved
// instantly") — so only statuses actually present in the data get a bar, in funnel order.
export function TimeInStageChart({ data }: { data: StageDuration[] }) {
  const daysByStatus = Object.fromEntries(data.map((row) => [row.status, row.avg_days_in_stage]))
  const chartData = STATUS_ORDER.filter((status) => status in daysByStatus).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    days: Math.round(daysByStatus[status] * 10) / 10,
  }))

  if (chartData.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-medium text-ink">Time in stage</h2>
        <p className="mt-4 text-sm text-ink/50">No applications yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-ink">Time in stage</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 32, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal={false} stroke="rgba(20,20,31,0.08)" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 12, fill: 'rgba(20,20,31,0.5)' }}
            axisLine={{ stroke: 'rgba(20,20,31,0.12)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={72}
            tick={{ fontSize: 12, fill: 'rgba(20,20,31,0.7)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(20,20,31,0.04)' }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(20,20,31,0.1)' }}
            formatter={(value) => [`${value} days`, 'Avg. time in stage']}
          />
          <Bar dataKey="days" barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
            ))}
            <LabelList
              dataKey="days"
              position="right"
              formatter={(value) => `${value}d`}
              style={{ fontSize: 12, fill: 'rgba(20,20,31,0.55)' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
