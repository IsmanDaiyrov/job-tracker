import { QueryClientProvider } from '@tanstack/react-query'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { queryClient } from './lib/queryClient'
import { ApplicationsBoardPage } from './routes/ApplicationsBoardPage'
import { ApplicationsTablePage } from './routes/ApplicationsTablePage'
import { DashboardLayout } from './routes/DashboardLayout'
import { LandingPage } from './routes/LandingPage'
import { LoginPage } from './routes/LoginPage'
import { OAuthCallbackPage } from './routes/OAuthCallbackPage'
import { RegisterPage } from './routes/RegisterPage'
import { ResumesPage } from './routes/ResumesPage'

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/auth/callback', element: <OAuthCallbackPage /> },
  {
    path: '/app',
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="table" replace /> },
          { path: 'table', element: <ApplicationsTablePage /> },
          { path: 'board', element: <ApplicationsBoardPage /> },
          { path: 'resumes', element: <ResumesPage /> },
        ],
      },
    ],
  },
])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
