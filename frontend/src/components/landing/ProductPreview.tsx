import { StatusBadge } from '../applications/StatusBadge'
import type { ApplicationStatus } from '../../types/application'

// Purely decorative, hardcoded previews for the landing page — not wired to any real data or
// API. Built from the same design tokens and, where safe, the same components (StatusBadge) as
// the real app, so it stays visually in sync automatically instead of going stale like a raster
// screenshot would the next time the UI changes.

function MiniAppHeader({ active }: { active: 'Table' | 'Board' }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
      <span className="font-display text-sm">
        Pipeline<span className="text-accent">.</span>
      </span>
      <div className="flex items-center gap-1">
        {(['Table', 'Board'] as const).map((label) => (
          <span
            key={label}
            className={
              'rounded-[7px] px-2.5 py-1 text-xs font-medium ' +
              (label === active ? 'bg-accent text-ink' : 'text-ink/40')
            }
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

const stripeColors: Record<ApplicationStatus, string> = {
  saved: 'bg-ink/20',
  applied: 'bg-ink/20',
  screening: 'bg-accent',
  interview: 'bg-accent',
  offer: 'bg-sage',
  rejected: 'bg-coral',
  withdrawn: 'bg-ink/10',
}

const boardColumns: { label: string; cards: { company: string; role: string; status: ApplicationStatus }[] }[] = [
  { label: 'Applied', cards: [{ company: 'Notion', role: 'Full Stack Engineer', status: 'applied' }] },
  { label: 'Screening', cards: [{ company: 'Vercel', role: 'Frontend Engineer', status: 'screening' }] },
  {
    label: 'Interview',
    cards: [
      { company: 'Linear', role: 'Senior Product Engineer', status: 'interview' },
      { company: 'Airbnb', role: 'Senior Software Engineer', status: 'interview' },
    ],
  },
  { label: 'Offer', cards: [{ company: 'Figma', role: 'Software Engineer, Infra', status: 'offer' }] },
]

export function BoardPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-paper">
      <MiniAppHeader active="Board" />
      <div className="flex divide-x divide-ink/5 p-3">
        {boardColumns.map((column) => (
          <div key={column.label} className="w-40 shrink-0 px-2 first:pl-0 last:pr-0">
            <div className="px-1 text-[10px] font-medium uppercase tracking-wide text-ink/40">
              {column.label}
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {column.cards.map((card) => (
                <div
                  key={card.company}
                  className="relative rounded-[10px] border border-ink/10 bg-paper py-2 pl-3 pr-2"
                >
                  <span
                    className={
                      'absolute inset-y-0 left-0 w-1 rounded-l-[10px] ' + stripeColors[card.status]
                    }
                  />
                  <p className="text-xs font-medium">{card.company}</p>
                  <p className="mt-0.5 text-[11px] text-ink/50">{card.role}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const tableRows: { company: string; role: string; status: ApplicationStatus; applied: string }[] = [
  { company: 'Google', role: 'Software Engineer', status: 'interview', applied: 'Aug 3' },
  { company: 'Notion', role: 'Full Stack Engineer', status: 'applied', applied: 'Jul 29' },
  { company: 'Figma', role: 'Software Engineer, Infra', status: 'offer', applied: 'Jun 30' },
  { company: 'Datadog', role: 'Platform Engineer', status: 'rejected', applied: 'Jul 1' },
]

export function TablePreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-paper">
      <MiniAppHeader active="Table" />
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-[10px] uppercase tracking-wide text-ink/40">
            <th className="px-4 py-2.5 font-medium">Company</th>
            <th className="px-4 py-2.5 font-medium">Role</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Applied</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row) => (
            <tr key={row.company} className="border-b border-ink/5 last:border-0">
              <td className="px-4 py-2.5 text-xs font-medium">{row.company}</td>
              <td className="px-4 py-2.5 text-xs text-ink/70">{row.role}</td>
              <td className="px-4 py-2.5">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-2.5 text-xs text-ink/50">{row.applied}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
