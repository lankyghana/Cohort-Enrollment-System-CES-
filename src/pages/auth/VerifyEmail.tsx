import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

export const VerifyEmail = () => {
  return (
    <div className="app-shell min-h-screen flex items-center justify-center py-16">
      <Card className="glass-panel !border-white/40 !bg-white/95 w-full max-w-md p-10 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
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
          <h1 className="text-3xl font-heading font-semibold text-text">Check your email</h1>
          <p className="mt-2 text-text-soft">
            We've sent a verification link to your email address. Please click the link to verify your account.
          </p>
        </div>

        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            Resend Verification Email
          </Button>
          <Link to="/login" className="block text-sm font-semibold text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  )
}


