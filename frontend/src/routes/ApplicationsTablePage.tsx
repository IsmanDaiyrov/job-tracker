import { useState } from 'react'
import { ApplicationFormModal } from '../components/applications/ApplicationFormModal'
import { ApplicationTable } from '../components/applications/ApplicationTable'
import { Button } from '../components/ui/Button'
import { useApplicationsQuery, useDeleteApplication } from '../hooks/useApplications'
import type { Application } from '../types/application'

export function ApplicationsTablePage() {
  const { data: applications, isLoading } = useApplicationsQuery()
  const deleteMutation = useDeleteApplication()
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl">Applications</h1>
        <Button onClick={openAddModal}>Add application</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : (
        <ApplicationTable
          applications={applications ?? []}
          onEdit={openEditModal}
          onDelete={(application) => deleteMutation.mutate(application.id)}
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
