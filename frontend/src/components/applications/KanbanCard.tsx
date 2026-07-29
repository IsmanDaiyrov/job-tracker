import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import type { Application, ApplicationStatus } from '../../types/application'

const stripeColors: Record<ApplicationStatus, string> = {
  saved: 'bg-ink/20',
  applied: 'bg-ink/20',
  screening: 'bg-accent',
  interview: 'bg-accent',
  offer: 'bg-sage',
  rejected: 'bg-coral',
}

function daysSince(dateStr: string | null): string | null {
  if (!dateStr) return null
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function KanbanCard({
  application,
  onClick,
}: {
  application: Application
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  })

  const days = daysSince(application.applied_at)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      onClick={onClick}
      className={clsx(
        'group relative cursor-pointer rounded-[10px] border border-ink/10 bg-paper py-3 pl-4 pr-3 hover:border-ink/25',
        isDragging && 'opacity-40',
      )}
    >
      <span
        className={clsx('absolute inset-y-0 left-0 w-1 rounded-l-[10px]', stripeColors[application.status])}
      />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{application.company}</p>
          <p className="mt-0.5 text-xs text-ink/50">{application.role_title}</p>
        </div>
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab text-ink/20 opacity-0 group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Drag to move"
        >
          ⠿
        </button>
      </div>
      {days && (
        <span className="mt-3 inline-block rounded-full bg-ink/5 px-2 py-0.5 text-[11px] text-ink/50">
          {days}
        </span>
      )}
    </div>
  )
}
