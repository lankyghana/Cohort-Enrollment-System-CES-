import { Link } from 'react-router-dom'

const CourseCard = ({ title, cat, desc }: { title: string; cat: string; desc: string }) => (
  <div className="surface-card hover-lift h-full overflow-hidden">
    <div className="h-48 rounded-[24px] bg-card-glow" />
    <div className="mt-6 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">{cat}</p>
      <h3 className="text-xl font-semibold text-text">{title}</h3>
      <p className="text-sm text-text-soft">{desc}</p>
      <Link to="/courses" className="text-sm font-semibold text-primary hover:underline">
        View course →
      </Link>
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
    <section className="py-16">
      <div className="container-custom space-y-8">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <p className="pill bg-primary/10 text-primary">Featured programs</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="section-heading">Cohorts sourced from the admin marketplace</h2>
            <Link to="/courses" className="text-sm font-semibold text-primary hover:underline">
              View full catalog →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {sample.map((c) => (
            <CourseCard key={c.title} title={c.title} cat={c.cat} desc={c.desc} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedCourses
