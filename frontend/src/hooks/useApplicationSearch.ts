import { useSearchParams } from 'react-router-dom'
import type { Application } from '../types/application'

// Search + interviewed-filter state lives in the URL (?q=..., ?interviewed=1) rather than local
// component state, so switching between Table and Board keeps both, and they survive a page
// refresh. Filtering is client-side against the already-cached application list.
export function useApplicationSearch(applications: Application[] | undefined) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const interviewedOnly = searchParams.get('interviewed') === '1'

  // Both setters merge into the existing params rather than replacing them wholesale, so setting
  // one doesn't clobber the other.
  const setQuery = (value: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set('q', value)
        else next.delete('q')
        return next
      },
      { replace: true },
    )

  const setInterviewedOnly = (value: boolean) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set('interviewed', '1')
        else next.delete('interviewed')
        return next
      },
      { replace: true },
    )

  const filtered =
    applications
      ?.filter((a) => `${a.company} ${a.role_title}`.toLowerCase().includes(query.toLowerCase()))
      .filter((a) => !interviewedOnly || a.ever_interviewed) ?? []

  return { query, setQuery, interviewedOnly, setInterviewedOnly, filtered }
}
