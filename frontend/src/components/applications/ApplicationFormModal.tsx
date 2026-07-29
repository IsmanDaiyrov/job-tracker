import type { Application } from '../../types/application'
import { useCreateApplication, useUpdateApplication } from '../../hooks/useApplications'
import { Modal } from '../ui/Modal'
import { ApplicationForm, type ApplicationFormValues } from './ApplicationForm'

export function ApplicationFormModal({
  open,
  onClose,
  editingApplication,
}: {
  open: boolean
  onClose: () => void
  editingApplication: Application | null
}) {
  const createMutation = useCreateApplication()
  const updateMutation = useUpdateApplication()

  const handleSubmit = async (values: ApplicationFormValues) => {
    const payload = {
      ...values,
      job_url: values.job_url || null,
      applied_at: values.applied_at || null,
    }

    if (editingApplication) {
      await updateMutation.mutateAsync({ id: editingApplication.id, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingApplication ? 'Edit application' : 'Add application'}
    >
      <ApplicationForm
        initialValues={editingApplication ?? undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel={editingApplication ? 'Save changes' : 'Add application'}
      />
    </Modal>
  )
}
