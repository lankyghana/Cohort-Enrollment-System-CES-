import { Link } from 'react-router-dom'

const CourseCard = ({ title, cat, desc }: { title: string; cat: string; desc: string }) => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1">
    <div className="h-40 bg-gray-200" />
    <div className="p-4">
      <div className="text-sm text-indigo-600 font-semibold">{cat}</div>
      <div className="font-semibold text-lg text-gray-900 mt-1">{title}</div>
      <div className="text-sm text-gray-500 mt-2">{desc}</div>
      <div className="mt-4">
        <Link to="/courses" className="text-sm text-indigo-600 hover:underline">View Course →</Link>
      </div>
    </div>
  </div>
)

export const FeaturedCourses = () => {
  const sample = [
    { title: 'Full-Stack Modern Web', cat: 'Web Development', desc: 'Build production-ready apps with React and Node.' },
    { title: 'Data Engineering Bootcamp', cat: 'Data', desc: 'ETL, warehouses, and scalable pipelines.' },
    { title: 'Product Design Cohort', cat: 'Design', desc: 'User-centered design and prototyping.' },
  ]

  return (
    <section className="py-12">
      <div className="container-custom">
        <h2 className="text-2xl font-heading font-bold mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sample.map((c) => (
            <CourseCard key={c.title} title={c.title} cat={c.cat} desc={c.desc} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedCourses
