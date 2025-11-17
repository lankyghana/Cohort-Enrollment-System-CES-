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
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl font-heading font-bold mb-6 text-center">What our students say</h2>

        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-md text-center">
          <div className="mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 inline-block" />
          </div>
          <div className="font-semibold">{t.name}</div>
          <div className="text-gray-600 mt-2">“{t.quote}”</div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
