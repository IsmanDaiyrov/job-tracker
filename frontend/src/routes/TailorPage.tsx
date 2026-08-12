import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TailorForm } from '../components/tailor/TailorForm'
import { TailorResults } from '../components/tailor/TailorResults'
import { useResumesQuery } from '../hooks/useResumes'
import { useTailorResume } from '../hooks/useTailor'

// The /app/tailor page: paste a job description, pick a resume, and get back suggested bullet
// edits and a cover letter draft from Claude. Standalone rather than tied to a saved application,
// since tailoring naturally happens before you've applied (and possibly before you've logged
// anything) — see TailorResults' footnote for why nothing here is saved automatically.
export function TailorPage() {
  const { data: resumes, isLoading } = useResumesQuery()
  const [resumeId, setResumeId] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const tailorMutation = useTailorResume()

  useEffect(() => {
    if (!resumeId && resumes && resumes.length > 0) {
      setResumeId(resumes.find((r) => r.is_base)?.id ?? resumes[0].id)
    }
  }, [resumes, resumeId])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl">Tailor resume</h1>
        <p className="mt-1 text-sm text-ink/50">
          Paste a job description and get suggested edits tailored to it.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : resumes && resumes.length === 0 ? (
        <p className="text-sm text-ink/50">
          You need at least one uploaded resume first. Head over to{' '}
          <Link to="/app/resumes" className="font-medium text-ink underline">
            Resumes
          </Link>{' '}
          to upload one.
        </p>
      ) : (
        <div className="max-w-2xl">
          <TailorForm
            resumes={resumes ?? []}
            resumeId={resumeId}
            onResumeIdChange={setResumeId}
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            onSubmit={() => tailorMutation.mutate({ resumeId, jobDescription })}
            isPending={tailorMutation.isPending}
          />

          {tailorMutation.isError && (
            <p className="mt-3 text-xs text-coral">Something went wrong. Please try again.</p>
          )}

          {tailorMutation.data && <TailorResults result={tailorMutation.data} />}
        </div>
      )}
    </div>
  )
}
