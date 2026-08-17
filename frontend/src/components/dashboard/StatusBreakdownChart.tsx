import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { STATUS_LABELS } from '../../types/application'
import type { StatusCount } from '../../types/stats'
import { STATUS_CHART_COLORS, STATUS_ORDER } from '../../lib/statusPalette'

// Horizontal bar chart: one bar per application status, in fixed funnel order. Every status
// always renders (even at zero) so the shape of the funnel is comparable across visits.
export function StatusBreakdownChart({ data }: { data: StatusCount[] }) {
  const countByStatus = Object.fromEntries(data.map((row) => [row.status, row.count]))
  const chartData = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: countByStatus[status] ?? 0,
  }))

  return (
    <div>
      <h2 className="text-sm font-medium text-ink">Status breakdown</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 28, bottom: 0, left: 0 }}>
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
            formatter={(value) => [value, 'Applications']}
          />
          <Bar dataKey="count" barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
            ))}
            <LabelList dataKey="count" position="right" style={{ fontSize: 12, fill: 'rgba(20,20,31,0.55)' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
