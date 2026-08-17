export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export interface Application {
  id: string
  user_id: string
  company: string
  role_title: string
  job_description: string | null
  job_url: string | null
  status: ApplicationStatus
  applied_at: string | null
  notes: string | null
  status_changed_at: string
  ever_interviewed: boolean
  created_at: string
  updated_at: string
}

export interface ApplicationInput {
  company: string
  role_title: string
  job_description?: string | null
  job_url?: string | null
  status?: ApplicationStatus
  applied_at?: string | null
  notes?: string | null
}
