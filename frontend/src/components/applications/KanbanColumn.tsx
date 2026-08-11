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
      <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3 text-xs uppercase tracking-wide text-ink/40">
        <h3 className="font-medium">{STATUS_LABELS[status]}</h3>
        <span>{applications.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={clsx(
          'flex min-h-24 flex-1 flex-col gap-2 p-2 transition-colors',
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
