import clsx from 'clsx'
import { useDeleteResume, useDownloadResume, useUpdateResume } from '../../hooks/useResumes'
import type { Resume } from '../../types/resume'

// Human-readable file type labels shown in the list, keyed by the raw MIME content type.
const EXTENSION_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
}

// A single resume row: label, file type, upload date, a "Default" badge if applicable, and
// Set as default/Download/Delete actions wired to their respective mutations.
export function ResumeRow({ resume }: { resume: Resume }) {
  const updateMutation = useUpdateResume()
  const deleteMutation = useDeleteResume()
  const downloadMutation = useDownloadResume()

  return (
    <div className="flex items-center justify-between border-b border-ink/5 px-4 py-3 last:border-0">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-medium">{resume.label}</p>
          <p className="mt-0.5 text-xs text-ink/50">
            {EXTENSION_LABELS[resume.content_type] ?? resume.content_type} ·{' '}
            {new Date(resume.created_at).toLocaleDateString()}
          </p>
        </div>
        {resume.is_base && (
          <span className="inline-flex items-center rounded-full bg-accent/30 px-2.5 py-0.5 text-xs font-medium text-ink">
            Default
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs font-medium">
        {!resume.is_base && (
          <button
            onClick={() => updateMutation.mutate({ id: resume.id, payload: { is_base: true } })}
            className="text-ink/50 hover:text-ink"
          >
            Set as default
          </button>
        )}
        <button
          onClick={() => downloadMutation.mutate(resume.id)}
          className={clsx('text-ink/50 hover:text-ink', downloadMutation.isPending && 'opacity-50')}
        >
          Download
        </button>
        <button
          onClick={() => deleteMutation.mutate(resume.id)}
          className="text-ink/50 hover:text-coral"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
