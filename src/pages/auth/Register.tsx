import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

export const Register = () => {
  const navigate = useNavigate()
  const { signUp } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>()

  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError(null)
      setIsLoading(true)

      // Use Laravel API for registration
      await signUp(data.fullName, data.email, data.password)

      // Redirect to dashboard after successful registration
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-shell min-h-screen py-16">
      <div className="container-custom grid items-center gap-12 lg:grid-cols-[1fr,_0.9fr]">
        <div className="space-y-6">
          <span className="pill bg-primary/10 text-primary">Join the cohort</span>
          <h1 className="text-4xl font-heading font-semibold text-text">
            Create an account and <span className="gradient-text">access curated sessions</span>
          </h1>
          <p className="text-lg text-text-soft">
            Enrollment unlocks tailored programs, weekly live teaching, and the new glass dashboard that keeps your momentum high.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Structured learning path',
              'Secure authentication',
              'Assignments & submissions',
              'Instant progress syncing',
            ].map((item) => (
              <div key={item} className="surface-card p-4 text-sm text-text">
                {item}
              </div>
            ))}
          </div>
        </div>

        <Card className="glass-panel !border-white/40 !bg-white/95 p-8">
          <div className="mb-6 text-center text-text">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Create account</p>
            <h2 className="mt-3 text-3xl font-heading font-semibold">Start your cohort experience</h2>
            <p className="text-sm text-text-soft">All confirmations happen via email</p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              {...register('fullName', {
                required: 'Full name is required',
              })}
              error={errors.fullName?.message}
            />

            <Input
              label="Email"
              type="email"
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
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign Up
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-soft">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}


