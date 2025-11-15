import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-heading font-bold mb-6">
              Transform Your Career with Cohort-Based Learning
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Join structured learning programs designed to help you master new skills
              and advance your career with expert instructors and a supportive community.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container-custom">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            Why Choose Cohort Enrollment?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
              <p className="text-text-light">
                Learn from industry professionals with years of real-world experience.
              </p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold mb-2">Live Sessions</h3>
              <p className="text-text-light">
                Participate in interactive live classes and get real-time feedback.
              </p>
            </Card>
            <Card>
              <h3 className="text-xl font-semibold mb-2">Certificates</h3>
              <p className="text-text-light">
                Earn verified certificates upon course completion to showcase your skills.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-text-light mb-8 max-w-2xl mx-auto">
            Join thousands of students already enrolled in our courses and take the next step in your career.
          </p>
          <Button size="lg" asChild>
            <Link to="/register">Enroll Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

