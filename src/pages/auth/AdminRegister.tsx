import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

export const AdminRegister = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [adminExists, setAdminExists] = useState<boolean | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()
  const password = watch('password')

  useEffect(() => {
    // Check if an admin account already exists
    const checkAdmin = async () => {
      try {
        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'admin')

        setAdminExists((count || 0) > 0)
      } catch (err) {
        console.error('Error checking admin existence', err)
        setAdminExists(true) // be conservative
      }
    }

    checkAdmin()
  }, [])

  const onSubmit = async (data: RegisterForm) => {
    if (adminExists) {
      setError('An admin account already exists. Please sign in instead.')
      return
    }

    try {
      setError(null)
      setIsLoading(true)

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // If signup returned a user, attempt to create a profile row with role 'admin'
      try {
        const userId = signUpData?.user?.id
        if (userId) {
          const { error: insertErr } = await supabase.from('users').insert([
            { id: userId, email: data.email, full_name: data.fullName, role: 'admin' },
          ])

          if (insertErr) {
            console.warn('Failed to insert admin profile row', insertErr.message)
          }
        }
      } catch (e) {
        console.warn('Error upserting admin profile:', e)
      }

      // Inform the user that signup was successful and that admin provisioning
      // may require backend promotion to role 'admin'. The app prevents more
      // than one admin being created by checking the users table above.
      navigate('/verify-email')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (adminExists === null) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">Checking admin account…</Card>
      </div>
    )
  }

  if (adminExists) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Admin Account Exists</h1>
          <p className="text-sm text-text-light mb-4">An administrator account has already been created. If this is you, please sign in.</p>
          <div className="flex gap-2 justify-center">
            <Link to="/admin-login" className="text-primary hover:underline font-medium">Admin Sign In</Link>
            <Link to="/login" className="text-primary hover:underline font-medium">Participant Login</Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-heading font-bold mb-6 text-center">Create Admin Account</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            {...register('fullName', { required: 'Full name is required' })}
            error={errors.fullName?.message}
          />

          <Input
            label="Email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
            error={errors.password?.message}
          />

          <Input
            label="Confirm Password"
            type="password"
            {...register('confirmPassword', { required: 'Please confirm your password', validate: (value) => value === password || 'Passwords do not match' })}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>Create Admin</Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-light">
          Already have an account? <Link to="/admin-login" className="text-primary hover:underline font-medium">Admin Sign In</Link>
        </p>
      </Card>
    </div>
  )
}

export default AdminRegister
