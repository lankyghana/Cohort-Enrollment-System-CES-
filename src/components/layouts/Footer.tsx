import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-heading font-bold text-primary mb-4">
              Cohort Enrollment
            </h3>
            <p className="text-sm text-text-light">
              Empowering learners through structured cohort-based education.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-text mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-text-light">
              <li>
                <Link to="/courses" className="hover:text-primary transition-colors">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-text-light">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-text-light">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-text-light">
          <p>&copy; {new Date().getFullYear()} Cohort Enrollment Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

