import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
} from "../../types/application";
import { KanbanColumn } from "./KanbanColumn";

export function KanbanBoard({
  applications,
  onStatusChange,
  onCardClick,
}: {
  applications: Application[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onCardClick: (application: Application) => void;
}) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const newStatus = over.id as ApplicationStatus;
    const application = applications.find((a) => a.id === active.id);
    if (application && application.status !== newStatus) {
      onStatusChange(application.id, newStatus);
    }
  };

  return (
    // `useDraggable`'s transform is a raw pointer-delta translate with no
    // bounds of its own — without this modifier, dragging a card past the
    // last column just keeps sliding it off-board indefinitely. Clamps it to
    // the nearest scrollable ancestor, which is the bordered wrapper below.
    <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToFirstScrollableAncestor]}>
      <div className="overflow-x-auto rounded-xl border border-ink/10">
        <div className="flex divide-x divide-ink/5">
          {APPLICATION_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={applications.filter((a) => a.status === status)}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
