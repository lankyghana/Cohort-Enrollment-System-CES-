import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

export const VerifyEmail = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold mb-2">Check Your Email</h1>
          <p className="text-text-light">
            We've sent a verification link to your email address. Please click the link to verify your account.
          </p>
        </div>

        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            Resend Verification Email
          </Button>
          <Link to="/login" className="block text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  )
}

