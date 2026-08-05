import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../ui/Button'

const links = [
  { to: '/app/table', label: 'Table' },
  { to: '/app/board', label: 'Board' },
  { to: '/app/resumes', label: 'Resumes' },
]

export function NavBar() {
  const { user, logout } = useAuth()

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
              to={link.to}
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
