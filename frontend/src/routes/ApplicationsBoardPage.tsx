import { useState } from 'react'
import { ApplicationFormModal } from '../components/applications/ApplicationFormModal'
import { KanbanBoard } from '../components/applications/KanbanBoard'
import { Button } from '../components/ui/Button'
import { useApplicationsQuery, useUpdateApplication } from '../hooks/useApplications'
import type { Application, ApplicationStatus } from '../types/application'

export function ApplicationsBoardPage() {
  const { data: applications, isLoading } = useApplicationsQuery()
  const updateMutation = useUpdateApplication()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Application | null>(null)

  const openAddModal = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEditModal = (application: Application) => {
    setEditing(application)
    setModalOpen(true)
  }

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    updateMutation.mutate({ id, payload: { status } })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl">Applications</h1>
        <Button onClick={openAddModal}>Add application</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : (
        <KanbanBoard
          applications={applications ?? []}
          onStatusChange={handleStatusChange}
          onCardClick={openEditModal}
        />
      )}

      <ApplicationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingApplication={editing}
      />
    </div>
  )
}
