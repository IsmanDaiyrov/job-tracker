import { useState } from 'react'
import { ResumeFormModal } from '../components/resumes/ResumeFormModal'
import { ResumeList } from '../components/resumes/ResumeList'
import { Button } from '../components/ui/Button'
import { useResumesQuery } from '../hooks/useResumes'

// The /app/resumes page: an "Upload resume" button that opens the upload modal, plus the list of
// the current user's resumes, mirroring ApplicationsTablePage's overall layout.
export function ResumesPage() {
  const { data: resumes, isLoading } = useResumesQuery()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl">Resumes</h1>
        <Button onClick={() => setModalOpen(true)}>Upload resume</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : (
        <ResumeList resumes={resumes ?? []} />
      )}

      <ResumeFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
