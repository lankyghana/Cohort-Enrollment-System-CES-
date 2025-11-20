import { useEffect, useState } from 'react'

const testimonials = [
  { name: 'Amina', quote: 'Transformative course — I landed a new job within months.', avatar: '' },
  { name: 'Kwame', quote: 'Practical, hands-on and well organized.', avatar: '' },
  { name: 'Sara', quote: 'Amazing instructors and community support.', avatar: '' },
]

export const Testimonials = () => {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 6000)
    return () => clearInterval(t)
  }, [])

  const t = testimonials[idx]

  return (
    <section id="testimonials" className="py-16">
      <div className="container-custom space-y-8">
        <div className="text-center">
          <p className="pill mx-auto bg-primary/10 text-primary">Testimonials</p>
          <h2 className="section-heading mt-4">Loved by learners across Africa</h2>
        </div>
        <div className="glass-panel mx-auto max-w-3xl px-10 py-12 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-fuchsia-500" />
          <p className="text-xl font-semibold text-text">{t.name}</p>
          <p className="mt-4 text-lg text-text-soft">“{t.quote}”</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            {testimonials.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === idx ? 'bg-primary' : 'bg-text-soft/30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
