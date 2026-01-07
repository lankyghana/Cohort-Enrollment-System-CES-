import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

interface RegisterForm {
  email: string
  phone: string
  password: string
  fullName: string
}

export const AdminRegister = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [adminExists, setAdminExists] = useState<boolean | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const passwordHelperText = useMemo(
    () => 'Password must be at least 8 characters and include a letter and a number.',
    []
  )

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>()

  useEffect(() => {
    // Check if an admin account already exists
    const checkAdmin = async () => {
      try {
        const response = await api.get('/admin/check')
        setAdminExists(response.data.exists || false)
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

      const { signUp } = useAuthStore.getState()
      await signUp(data.fullName, data.email, data.phone, data.password, 'admin')

      navigate('/admin-login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
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
            label="Phone number"
            type="tel"
            placeholder="+233 24 123 4567"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: { value: /^[+()0-9\s-]{7,20}$/, message: 'Enter a valid phone number' },
            })}
            error={errors.phone?.message}
          />

          <Input
            label="Password"
            id="admin-register-password"
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              validate: {
                hasLetter: (value) => /[A-Za-z]/.test(value) || 'Password must include a letter',
                hasNumber: (value) => /\d/.test(value) || 'Password must include a number',
              },
            })}
            error={errors.password?.message}
            helperText={passwordHelperText}
            rightElement={
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-light hover:text-text focus:outline-none focus:ring-4 focus:ring-primary/10"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            }
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

