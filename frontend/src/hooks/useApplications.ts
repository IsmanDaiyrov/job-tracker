import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Application, ApplicationInput } from '../types/application'

const APPLICATIONS_KEY = ['applications']

// Send HTTP requests related to job applications, providing hooks for listing, creating, updating, and deleting applications associated with the authenticated user. 
// The hooks utilize React Query for data fetching and caching, and they ensure that the application list is kept up-to-date by invalidating queries after mutations.

// Hook to fetch all applications
export function useApplicationsQuery() {
  return useQuery({
    queryKey: APPLICATIONS_KEY,
    queryFn: async () => (await api.get<Application[]>('/applications')).data,
  })
}

// Hook to create a new application
export function useCreateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ApplicationInput) =>
      (await api.post<Application>('/applications', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY }),
  })
}

//  Hook to update an existing application
export function useUpdateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<ApplicationInput> }) =>
      (await api.patch<Application>(`/applications/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY }),
  })
}

// Hook to delete an application
export function useDeleteApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/applications/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY }),
  })
}
