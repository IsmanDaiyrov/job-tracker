import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from '../../types/application'
import { KanbanColumn } from './KanbanColumn'

export function KanbanBoard({
  applications,
  onStatusChange,
  onCardClick,
}: {
  applications: Application[]
  onStatusChange: (id: string, status: ApplicationStatus) => void
  onCardClick: (application: Application) => void
}) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const newStatus = over.id as ApplicationStatus
    const application = applications.find((a) => a.id === active.id)
    if (application && application.status !== newStatus) {
      onStatusChange(application.id, newStatus)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications.filter((a) => a.status === status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  )
}
