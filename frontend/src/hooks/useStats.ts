import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { StatsOverview } from '../types/stats'

// Hook to fetch the current user's dashboard stats — status breakdown, response rate, and
// time-in-stage. Same shape as useResumesQuery.
export function useStatsQuery() {
  return useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: async () => (await api.get<StatsOverview>('/stats/overview')).data,
  })
}
