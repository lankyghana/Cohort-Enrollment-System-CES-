import HeroSection from '@/components/landing/HeroSection'
import StatsSection from '@/components/landing/StatsSection'
import HowItWorks from '@/components/landing/HowItWorks'
import FeaturedCourses from '@/components/landing/FeaturedCourses'
import Testimonials from '@/components/landing/Testimonials'
import FinalCTA from '@/components/landing/FinalCTA'
import LandingFooter from '@/components/landing/LandingFooter'

export const LandingPage = () => {
  return (
    <div className="space-y-4">
      <HeroSection />
      <StatsSection />
      <HowItWorks />
      <FeaturedCourses />
      <Testimonials />
      <FinalCTA />
      <LandingFooter />
    </div>
  )
}


