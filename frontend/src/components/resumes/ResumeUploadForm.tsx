import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ALLOWED_RESUME_CONTENT_TYPES, MAX_RESUME_SIZE_BYTES } from '../../types/resume'
import { Button } from '../ui/Button'
import { FieldError, Input, Label } from '../ui/Input'

// Client-side validation: requires exactly one file, checked against the allowed content types and
// the size cap before the form will even submit — this runs before any network call is made.
const uploadSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  file: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, 'Choose a file')
    .refine(
      (files) => files.length === 0 || ALLOWED_RESUME_CONTENT_TYPES.includes(files[0].type as never),
      'Only PDF or DOCX files are allowed',
    )
    .refine(
      (files) => files.length === 0 || files[0].size <= MAX_RESUME_SIZE_BYTES,
      'File must be under 10MB',
    ),
})

type UploadFormValues = z.infer<typeof uploadSchema>

// Form for uploading a new resume: a label field plus a native file input. Delegates the actual
// upload to the onSubmit prop (see ResumeFormModal), and shows a generic error if that rejects.
export function ResumeUploadForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: { label: string; file: File }) => Promise<void>
  onCancel: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormValues>({ resolver: zodResolver(uploadSchema) })

  const submit = async (values: UploadFormValues) => {
    setServerError(null)
    try {
      await onSubmit({ label: values.label, file: values.file[0] })
    } catch {
      setServerError('Upload failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <Label htmlFor="label">Label</Label>
        <Input id="label" placeholder="e.g. Base Resume" {...register('label')} />
        <FieldError>{errors.label?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="file">File (PDF or DOCX, up to 10MB)</Label>
        <input
          id="file"
          type="file"
          accept=".pdf,.docx"
          className="w-full rounded-[10px] border border-ink/15 bg-paper px-3 py-2 text-sm text-ink file:mr-3 file:rounded-[8px] file:border-0 file:bg-ink/5 file:px-3 file:py-1.5 file:text-sm"
          {...register('file')}
        />
        <FieldError>{errors.file?.message as string | undefined}</FieldError>
      </div>

      {serverError && <p className="text-xs text-coral">{serverError}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Uploading…' : 'Upload'}
        </Button>
      </div>
    </form>
  )
}
