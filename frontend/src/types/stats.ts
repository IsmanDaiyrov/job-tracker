import type { ApplicationStatus } from './application'

// Application count for one status, mirroring the backend's StatusCount schema.
export interface StatusCount {
  status: ApplicationStatus
  count: number
}

// Average days spent in a status's current stage, mirroring the backend's StageDuration schema.
export interface StageDuration {
  status: ApplicationStatus
  avg_days_in_stage: number
}

// Response from GET /stats/overview.
export interface StatsOverview {
  status_breakdown: StatusCount[]
  applied_count: number
  responded_count: number
  response_rate: number | null
  time_in_stage: StageDuration[]
  interviewed_count: number
}
