import { useUploadResume } from '../../hooks/useResumes'
import { Modal } from '../ui/Modal'
import { ResumeUploadForm } from './ResumeUploadForm'

// Modal wrapper around ResumeUploadForm — wires the upload mutation to the form and closes the
// modal once the upload actually succeeds, mirroring ApplicationFormModal's create/edit pattern.
export function ResumeFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const uploadMutation = useUploadResume()

  const handleSubmit = async (values: { label: string; file: File }) => {
    await uploadMutation.mutateAsync(values)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Upload resume">
      <ResumeUploadForm onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  )
}
