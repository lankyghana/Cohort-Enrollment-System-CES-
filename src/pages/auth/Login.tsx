import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'

interface LoginForm {
  email: string
  password: string
}

export const Login = () => {
  const navigate = useNavigate()
  const { signIn, initialize, getUserRole } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null)
      setIsLoading(true)

      // Use Laravel API for authentication
      await signIn(data.email, data.password)

      await initialize()

      const role = getUserRole()
      if (role !== 'student') {
        setError('This account is not a student account. Please sign in with the correct login.')
        return
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-shell min-h-screen py-16">
      <div className="container-custom grid items-center gap-12 lg:grid-cols-[1.1fr,_0.9fr]">
        <div className="space-y-6">
          <span className="pill bg-primary/10 text-primary">Student portal</span>
          <h1 className="text-4xl font-heading font-semibold text-text">
            Log back in and continue <span className="gradient-text">your learning journey</span>
          </h1>
          <p className="text-lg text-text-soft">
            Centralize your cohort schedule, assignments, and live sessions in a single glassy dashboard experience.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Personalized progress tracking',
              'Live session reminders',
              'Resource downloads',
              'Secure authentication',
            ].map((feature) => (
              <div key={feature} className="surface-card p-4 text-sm text-text">
                {feature}
              </div>
            ))}
          </div>
        </div>

        <Card className="glass-panel !border-white/40 !bg-white/95 p-8">
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Welcome back</p>
            <h2 className="mt-3 text-3xl font-heading font-semibold text-text">Sign in to your account</h2>
            <p className="text-sm text-text-soft">Use the same email you registered with</p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              aria-label="Email Address"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              aria-label="Password"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />

            <div className="flex items-center justify-between text-sm">
              <Link to="/reset-password" className="font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-soft">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}


