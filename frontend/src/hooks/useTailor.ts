import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { TailorResult } from '../types/tailor'

// Hook to tailor a resume against a job description. Deliberately not a query — nothing about a
// tailoring request is persisted or cached, it's a one-shot generation per click of "Generate".
export function useTailorResume() {
  return useMutation({
    mutationFn: async ({ resumeId, jobDescription }: { resumeId: string; jobDescription: string }) =>
      (
        await api.post<TailorResult>(`/resumes/${resumeId}/tailor`, {
          job_description: jobDescription,
        })
      ).data,
  })
}
