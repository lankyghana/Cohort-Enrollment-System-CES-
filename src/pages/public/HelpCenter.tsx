export const HelpCenter = () => {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-heading font-bold tracking-tight text-black sm:text-4xl">Help Center</h1>
        <p className="mt-4 text-base leading-relaxed text-black">Need assistance? Were here to help.</p>

        <div className="mt-6 space-y-6 text-base leading-relaxed text-black">
          <p>
            The SkillTech Cohort Help Center is the official channel for reaching our support team regarding enrollment,
            payments, courses, and account access.
          </p>

          <h2 className="pt-2 text-xl font-semibold text-black">How to Reach SkillTech Cohort Support</h2>
          <h3 className="text-lg font-semibold text-black">Primary Support Channel</h3>
          <p>
            All support requests are handled through our official contact channels to ensure your issue is tracked and
            resolved properly.
          </p>

          <p>
            <span className="font-semibold">Support Email:</span>{' '}
            <a className="text-blue-700 underline" href="mailto:support@skilltechcohort.com">
              support@skilltechcohort.com
            </a>
          </p>

          <p>Please use the email address associated with your SkillTech Cohort account when contacting us.</p>

          <h2 className="pt-2 text-xl font-semibold text-black">What to Include in Your Message</h2>
          <p>To help us assist you faster, include:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Your full name</li>
            <li>Your registered email address</li>
            <li>The course or cohort name (if applicable)</li>
            <li>
              A clear description of the issue (e.g. payment, enrollment, access, sessions)
            </li>
          </ul>
          <p>Incomplete messages may delay resolution.</p>

          <h2 className="pt-2 text-xl font-semibold text-black">Common Reasons to Contact Us</h2>
          <p>You can reach out if you need help with:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Completing course selection after registration</li>
            <li>Enrollment or payment issues</li>
            <li>Outstanding balance or access restrictions</li>
            <li>Course start dates and access timing</li>
            <li>Technical issues accessing your dashboard or resources</li>
          </ul>

          <h2 className="pt-2 text-xl font-semibold text-black">Response Time</h2>
          <p>
            We aim to respond to all support requests within a reasonable timeframe. Response times may vary depending on
            request volume, but every message is reviewed.
          </p>

          <h2 className="pt-2 text-xl font-semibold text-black">Important Notes</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>SkillTech Cohort support will never ask for your password or payment PIN.</li>
            <li>All official communication will come from SkillTech Cohorts verified channels.</li>
            <li>
              Payments and enrollment decisions follow platform rules and cannot be bypassed through support requests.
            </li>
          </ul>

          <h2 className="pt-2 text-xl font-semibold text-black">Before Contacting Support</h2>
          <p>We recommend first checking:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Your dashboard notifications</li>
            <li>Enrollment or payment status messages</li>
            <li>Course start date information</li>
          </ul>
          <p>
            Many issues resolve automatically once required steps are completed.
          </p>

          <p>
            SkillTech Cohort is committed to providing structured, transparent support while maintaining the integrity of
            our cohort-based learning experience.
          </p>
        </div>
      </div>
    </section>
  )
}
