import { Link } from 'react-router-dom'
import { APP_NAME } from '@/config/app'

export const Footer = () => {
  return (
    <footer className="relative mt-auto px-4 pb-10 pt-16 sm:px-6 lg:px-10">
      <div className="gradient-shell">
        <div className="container-custom relative z-10 grid gap-10 px-6 py-12 md:grid-cols-4">
          <div>
            <p className="pill bg-primary/10 text-primary-dark">Trusted Learning</p>
            <h3 className="mt-4 text-2xl font-heading font-semibold text-slate-900">{APP_NAME}</h3>
            <p className="mt-3 text-sm text-text-soft">
              Premium cohort orchestration with concierge onboarding, live facilitation, and outcome tracking.
            </p>
          </div>

          {[
            {
              heading: 'Platform',
              items: [
                { label: 'Browse Courses', href: '/courses' },
                { label: 'About', href: '/about' },
              ],
            },
            {
              heading: 'Support',
              items: [
                { label: 'Help Center', href: '#' },
                { label: 'Contact', href: '#' },
              ],
            },
            {
              heading: 'Legal',
              items: [
                { label: 'Privacy', href: '#' },
                { label: 'Terms', href: '#' },
              ],
            },
          ].map((section) => (
            <div key={section.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-text-soft">
                {section.heading}
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-text">
                {section.items.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith('/') ? (
                      <Link to={item.href} className="hover:text-primary">
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} className="hover:text-primary">
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/60 px-6 py-6 text-center text-sm text-text-soft">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}


