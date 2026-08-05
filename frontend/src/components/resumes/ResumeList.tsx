import type { Resume } from '../../types/resume'
import { ResumeRow } from './ResumeRow'

// Renders the resume library as a list of rows, or an empty state if the user has none yet.
export function ResumeList({ resumes }: { resumes: Resume[] }) {
  if (resumes.length === 0) {
    return (
      <div className="rounded-xl border border-ink/10 py-16 text-center text-sm text-ink/50">
        No resumes yet. Upload your first one to get started.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-ink/10">
      {resumes.map((resume) => (
        <ResumeRow key={resume.id} resume={resume} />
      ))}
    </div>
  )
}
