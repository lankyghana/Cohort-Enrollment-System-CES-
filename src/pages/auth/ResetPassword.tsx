import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'

interface ResetPasswordForm {
  email: string
}

export const ResetPassword = () => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>()

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setError(null)
      setIsLoading(true)

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const FormCard = (
    <Card className="glass-panel !border-white/40 !bg-white/95 w-full max-w-md p-8">
      <div className="mb-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Reset password</p>
        <h1 className="mt-3 text-3xl font-heading font-semibold text-text">Get a fresh link</h1>
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
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-soft">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </p>
    </Card>
  )

  if (success) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center py-16">
        <Card className="glass-panel !border-white/40 !bg-white/95 w-full max-w-md p-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Check your email</p>
          <h1 className="mt-3 text-3xl font-heading font-semibold text-text">Reset link sent</h1>
          <p className="mt-3 text-text-soft">We've sent a password reset link to your email address.</p>
          <Link to="/login" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-2 text-white">
            Back to login
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="app-shell min-h-screen flex items-center justify-center py-16">
      {FormCard}
    </div>
  )
}

