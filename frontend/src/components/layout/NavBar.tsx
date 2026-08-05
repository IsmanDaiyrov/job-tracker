import { NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../ui/Button'

const links = [
  { to: '/app/table', label: 'Table', preserveSearch: true },
  { to: '/app/board', label: 'Board', preserveSearch: true },
  { to: '/app/resumes', label: 'Resumes', preserveSearch: false },
]

export function NavBar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <header className="border-b border-ink/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="font-display text-lg">
          Pipeline<span className="text-accent">.</span>
        </span>

        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              // Carry the current ?q= search term across Table <-> Board so switching views
              // doesn't lose it — plain string `to` props drop the query string on navigation.
              to={link.preserveSearch ? { pathname: link.to, search: location.search } : link.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-[10px] px-3 py-1.5 text-sm font-medium transition',
                  isActive ? 'bg-accent text-ink' : 'text-ink/60 hover:text-ink',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-ink/50">{user?.email}</span>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  )
}
