import type { Application } from '../../types/application'
import { CompanyLogo } from '../ui/CompanyLogo'
import { StatusBadge } from './StatusBadge'

export function ApplicationTable({
  applications,
  onEdit,
  onDelete,
  emptyMessage = 'No applications yet. Add your first one to get started.',
}: {
  applications: Application[]
  onEdit: (application: Application) => void
  onDelete: (application: Application) => void
  emptyMessage?: string
}) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-ink/10 py-16 text-center text-sm text-ink/50">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink/10">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/40">
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Applied</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id} className="border-b border-ink/5 last:border-0">
              <td className="px-4 py-3 font-medium">
                <div className="flex items-center gap-2.5">
                  <CompanyLogo company={application.company} />
                  {application.job_url ? (
                    <a
                      href={application.job_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {application.company}
                    </a>
                  ) : (
                    application.company
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-ink/70">{application.role_title}</td>
              <td className="px-4 py-3">
                <StatusBadge status={application.status} />
              </td>
              <td className="px-4 py-3 text-ink/50">{application.applied_at ?? '—'}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(application)}
                  className="text-xs font-medium text-ink/50 hover:text-ink"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(application)}
                  className="ml-3 text-xs font-medium text-ink/50 hover:text-coral"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
