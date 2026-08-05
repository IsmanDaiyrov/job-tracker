import clsx from 'clsx'
import type { ApplicationStatus } from '../../types/application'
import { STATUS_LABELS } from '../../types/application'

const statusColors: Record<ApplicationStatus, string> = {
  saved: 'bg-ink/10 text-ink/70',
  applied: 'bg-ink/10 text-ink/70',
  screening: 'bg-accent/30 text-ink',
  interview: 'bg-accent/30 text-ink',
  offer: 'bg-sage/20 text-sage',
  rejected: 'bg-coral/15 text-coral',
  withdrawn: 'bg-ink/5 text-ink/40',
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusColors[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
