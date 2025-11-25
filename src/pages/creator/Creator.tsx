import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import apiClient from '@/services/apiClient'
import axios from 'axios'

type FormValues = {
  fullName: string
  email: string
  password: string
  role: 'admin' | 'instructor'
}

export const Creator = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ defaultValues: { role: 'instructor' } })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adminCount, setAdminCount] = useState<number | null>(null)
  const [instructorCount, setInstructorCount] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await apiClient.get('/api/users/counts')
        if (!mounted) return
        setAdminCount(data.admin_count ?? 0)
        setInstructorCount(data.instructor_count ?? 0)
      } catch (e) {
        // ignore; counts not critical (DB may not have table yet)
      }
    })()
    return () => { mounted = false }
  }, [])

  const onSubmit = async (values: FormValues) => {
    setError(null)
    setIsLoading(true)

    try {
      // Client-side checks first
      if (values.role === 'admin' && adminCount !== null && adminCount >= 1) {
        setError('An admin account already exists. This system only allows one admin.')
        setIsLoading(false)
        return
      }

      if (values.role === 'instructor' && instructorCount !== null && instructorCount >= 2) {
        setError('There are already two instructors. The system allows at most two instructors.')
        setIsLoading(false)
        return
      }

      // Sign up via Laravel API
      await apiClient.post('/register', {
        full_name: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
      })

      // On success, redirect to verify-email or admin-login depending on role
      if (values.role === 'admin') navigate('/admin-login')
      else navigate('/login')

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || 'An unknown error occurred.'
        setError(message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-heading font-bold mb-4 text-center">Create Admin / Instructor</h1>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" {...register('fullName', { required: 'Full name required' })} error={errors.fullName?.message} />
          <Input label="Email" type="email" {...register('email', { required: 'Email required' })} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password', { required: 'Password required', minLength: 8 })} error={errors.password?.message} />

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input {...register('role')} type="radio" value="instructor" defaultChecked /> Instructor
              </label>
              <label className="flex items-center gap-2">
                <input {...register('role')} type="radio" value="admin" /> Admin
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>Create Account</Button>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          Note: The system allows only one admin and a maximum of two instructors. Attempts to exceed these limits will be blocked.
        </div>
      </Card>
    </div>
  )
}

export default Creator

