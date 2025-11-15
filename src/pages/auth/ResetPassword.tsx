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

  if (success) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Check Your Email</h1>
          <p className="text-text-light mb-6">
            We've sent a password reset link to your email address.
          </p>
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-heading font-bold mb-6 text-center">Reset Password</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
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
            Send Reset Link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-light">
          Remember your password?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}

