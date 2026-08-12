import type { Resume } from '../../types/resume'
import { Button } from '../ui/Button'
import { Label, Textarea } from '../ui/Input'
import { Select } from '../ui/Select'

// Controlled form: pick a resume, paste a job description, hit Generate. State lives in
// TailorPage since the mutation result (rendered by TailorResults) lives there too.
export function TailorForm({
  resumes,
  resumeId,
  onResumeIdChange,
  jobDescription,
  onJobDescriptionChange,
  onSubmit,
  isPending,
}: {
  resumes: Resume[]
  resumeId: string
  onResumeIdChange: (id: string) => void
  jobDescription: string
  onJobDescriptionChange: (value: string) => void
  onSubmit: () => void
  isPending: boolean
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="resume">Resume</Label>
        <Select id="resume" value={resumeId} onChange={(e) => onResumeIdChange(e.target.value)}>
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.label}
              {resume.is_base ? ' (Default)' : ''}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="job_description">Job description</Label>
        <Textarea
          id="job_description"
          placeholder="Paste the job description..."
          rows={10}
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={isPending || !resumeId || !jobDescription.trim()}>
          {isPending ? 'Generating…' : 'Generate'}
        </Button>
      </div>
    </div>
  )
}
