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

export const InstructorLogin = () => {
  const navigate = useNavigate()
  const { initialize, getUserRole, signOut } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null)
      setIsLoading(true)

      const { signIn } = useAuthStore.getState()
      await signIn(data.email, data.password)
      await initialize()

      const role = getUserRole()
      if (role !== 'instructor') {
        // sign out and show friendly message
        await signOut()
        setError('This account is not an instructor. Please sign in with an instructor account.')
        return
      }

      navigate('/instructor')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-heading font-bold mb-6 text-center">Instructor Sign In</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />

          <Input label="Password" type="password" {...register('password', { required: 'Password is required' })} error={errors.password?.message} />

          <Button type="submit" className="w-full" isLoading={isLoading}>Sign In</Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-light">
          Use an instructor account to sign in.{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">Participant login</Link>
        </p>
      </Card>
    </div>
  )
}

export default InstructorLogin

