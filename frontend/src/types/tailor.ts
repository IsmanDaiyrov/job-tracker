// A single tailored bullet suggestion, mirroring the backend's BulletSuggestion schema.
export interface BulletSuggestion {
  original: string
  suggested: string
  why: string
}

// Response from POST /resumes/:id/tailor: suggested bullet edits plus a cover letter draft.
export interface TailorResult {
  bullets: BulletSuggestion[]
  cover_letter: string
}
