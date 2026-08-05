import { useSearchParams } from 'react-router-dom'
import type { Application } from '../types/application'

// Search state lives in the URL (?q=...) rather than local component state, so switching between
// Table and Board keeps the search term, and it survives a page refresh. Filtering is client-side
// against the already-cached application list, matching on company or role title together.
export function useApplicationSearch(applications: Application[] | undefined) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const setQuery = (value: string) =>
    setSearchParams(value ? { q: value } : {}, { replace: true })

  const filtered =
    applications?.filter((a) =>
      `${a.company} ${a.role_title}`.toLowerCase().includes(query.toLowerCase()),
    ) ?? []

  return { query, setQuery, filtered }
}
