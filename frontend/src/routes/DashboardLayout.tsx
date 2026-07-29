import { Outlet } from 'react-router-dom'
import { NavBar } from '../components/layout/NavBar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
