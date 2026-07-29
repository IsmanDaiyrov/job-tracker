import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Application, ApplicationInput } from '../types/application'

const APPLICATIONS_KEY = ['applications']

export function useApplicationsQuery() {
  return useQuery({
    queryKey: APPLICATIONS_KEY,
    queryFn: async () => (await api.get<Application[]>('/applications')).data,
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ApplicationInput) =>
      (await api.post<Application>('/applications', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY }),
  })
}

export function useUpdateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<ApplicationInput> }) =>
      (await api.patch<Application>(`/applications/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY }),
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/applications/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY }),
  })
}
