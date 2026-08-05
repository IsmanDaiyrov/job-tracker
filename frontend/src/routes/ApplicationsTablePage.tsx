import { useState } from 'react'
import { ApplicationFormModal } from '../components/applications/ApplicationFormModal'
import { ApplicationTable } from '../components/applications/ApplicationTable'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useApplicationSearch } from '../hooks/useApplicationSearch'
import { useApplicationsQuery, useDeleteApplication } from '../hooks/useApplications'
import type { Application } from '../types/application'

export function ApplicationsTablePage() {
  const { data: applications, isLoading } = useApplicationsQuery()
  const { query, setQuery, filtered } = useApplicationSearch(applications)
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
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl">Applications</h1>
        <div className="flex items-center gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company or role…"
            className="w-64"
          />
          <Button onClick={openAddModal}>Add application</Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : (
        <ApplicationTable
          applications={filtered}
          onEdit={openEditModal}
          onDelete={(application) => deleteMutation.mutate(application.id)}
          emptyMessage={
            query
              ? 'No applications match your search.'
              : 'No applications yet. Add your first one to get started.'
          }
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
