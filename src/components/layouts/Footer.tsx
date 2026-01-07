import { Link } from 'react-router-dom'
import { APP_NAME } from '@/config/app'

export const Footer = () => {
  return (
    <footer className="relative mt-auto border-t border-slate-200 bg-slate-900 px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-16 text-slate-100 sm:px-6 lg:px-10">
      <div className="container-custom">
        <div className="grid gap-10 px-6 py-12 md:grid-cols-4">
          <div>
            <p className="pill bg-white/10 text-white">Learn About Us</p>
            <h3 className="mt-4 text-2xl font-heading font-semibold text-white">{APP_NAME}</h3>
            <p className="mt-3 text-sm text-slate-300">
              Cohort-based education platform providing guided onboarding, live instructor-led sessions, and learner progress tracking.
            </p>
          </div>

          {[
            {
              heading: 'Platform',
              items: [
                { label: 'Browse Courses', href: '/courses' },
                { label: 'About Us', href: '/about' },
              ],
            },
            {
              heading: 'Support',
              items: [
                { label: 'Help Center', href: '/help-center' },
              ],
            },
            {
              heading: 'Legal',
              items: [
                { label: 'Privacy', href: '/privacy-policy' },
              ],
            },
          ].map((section) => (
            <div key={section.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
                {section.heading}
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-100">
                {section.items.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith('/') ? (
                      <Link to={item.href} className="hover:text-white">
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} className="hover:text-white">
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 px-6 py-6 text-center text-sm text-slate-300">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}


