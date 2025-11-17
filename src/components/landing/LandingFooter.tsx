import { Link } from 'react-router-dom'

export const LandingFooter = () => {
  return (
    <footer className="mt-12 border-t border-gray-200">
      <div className="container-custom py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-md" />
          <div className="font-semibold text-gray-900">Cohort</div>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/courses" className="text-sm text-gray-600 hover:text-gray-900">Courses</Link>
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900">About</Link>
          <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link>
        </div>

        <div className="flex items-center gap-3">
          <a href="#" aria-label="twitter" className="text-gray-500 hover:text-gray-900">Twitter</a>
          <a href="#" aria-label="github" className="text-gray-500 hover:text-gray-900">GitHub</a>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter
