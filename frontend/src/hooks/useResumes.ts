import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Resume, ResumeDownloadResponse, ResumeUploadResponse } from '../types/resume'

// Send HTTP requests related to resumes, providing hooks for listing, uploading, updating,
// downloading, and deleting resumes. Every mutation invalidates the shared query key afterward,
// same pattern as useApplications.ts, so the list re-fetches and stays in sync automatically.
const RESUMES_KEY = ['resumes']

// Hook to fetch all resumes for the current user.
export function useResumesQuery() {
  return useQuery({
    queryKey: RESUMES_KEY,
    queryFn: async () => (await api.get<Resume[]>('/resumes')).data,
  })
}

// Hook to upload a new resume. This is a two-step flow, not a single API call: first ask the
// backend to create the DB row and hand back a presigned S3 URL, then PUT the actual file bytes
// straight to that URL with a bare fetch (deliberately bypassing the shared `api` axios instance,
// since it would attach our own auth header and use the wrong base URL). If the S3 upload fails,
// best-effort delete the now-orphaned DB row before surfacing the error.
export function useUploadResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ label, file }: { label: string; file: File }) => {
      const { data } = await api.post<ResumeUploadResponse>('/resumes', {
        label,
        content_type: file.type,
      })

      const putResp = await fetch(data.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!putResp.ok) {
        await api.delete(`/resumes/${data.resume.id}`).catch(() => {})
        throw new Error('Upload to storage failed')
      }

      return data.resume
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RESUMES_KEY }),
  })
}

// Hook to update a resume's label and/or mark it as the base resume.
export function useUpdateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { label?: string; is_base?: boolean } }) =>
      (await api.patch<Resume>(`/resumes/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RESUMES_KEY }),
  })
}

// Hook to delete a resume.
export function useDeleteResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/resumes/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RESUMES_KEY }),
  })
}

// Hook to open a resume's file in a new tab: fetches a presigned download URL, then navigates to it.
export function useDownloadResume() {
  return useMutation({
    mutationFn: async (id: string) => (await api.get<ResumeDownloadResponse>(`/resumes/${id}/download`)).data,
    onSuccess: (data) => {
      window.open(data.download_url, '_blank')
    },
  })
}
