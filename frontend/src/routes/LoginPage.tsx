import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../auth/useAuth'
import { OAuthButtons } from '../components/auth/OAuthButtons'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Input'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)
    try {
      await login(data.email, data.password)
      navigate('/app/table')
    } catch {
      setServerError('Incorrect email or password.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-ink/10 p-8">
        <Link to="/" className="font-display text-lg">
          Pipeline<span className="text-accent">.</span>
        </Link>
        <h1 className="mt-6 font-display text-2xl">Welcome back</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </div>
          {serverError && <p className="text-xs text-coral">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-ink/40">
          <div className="h-px flex-1 bg-ink/10" />
          or continue with
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <OAuthButtons />

        <p className="mt-6 text-center text-sm text-ink/60">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-ink hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
