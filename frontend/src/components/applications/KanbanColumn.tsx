import { useDroppable } from '@dnd-kit/core'
import clsx from 'clsx'
import type { Application, ApplicationStatus } from '../../types/application'
import { STATUS_LABELS } from '../../types/application'
import { KanbanCard } from './KanbanCard'

export function KanbanColumn({
  status,
  applications,
  onCardClick,
}: {
  status: ApplicationStatus
  applications: Application[]
  onCardClick: (application: Application) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex w-64 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-ink/70">{STATUS_LABELS[status]}</h3>
        <span className="text-xs text-ink/30">{applications.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={clsx(
          'flex min-h-24 flex-1 flex-col gap-2 rounded-xl p-2 transition-colors',
          isOver ? 'bg-ink/5' : 'bg-transparent',
        )}
      >
        {applications.map((application) => (
          <KanbanCard
            key={application.id}
            application={application}
            onClick={() => onCardClick(application)}
          />
        ))}
      </div>
    </div>
  )
}
