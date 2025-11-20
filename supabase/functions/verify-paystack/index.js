/* eslint-disable */
// @ts-nocheck
// Supabase Edge Function (JavaScript)
// Hardened Paystack verification handler
// - Verifies Paystack transaction
// - Validates amount (Paystack amount is in the smallest currency unit)
// - Validates currency
// - Validates customer email (when available) or metadata.student_id
// - Checks idempotency (existing payment with same reference)
// - Creates enrollment (if not present) and payment record, then marks enrollment completed
// NOTE: This is best-effort atomicity. For full transactional guarantees, create a DB-side function
// that performs these steps in a single transaction and call it via RPC.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const APP_NAME = process.env.APP_NAME || process.env.VITE_APP_NAME || 'Cohort Enrollment Platform'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !PAYSTACK_SECRET) {
  console.warn('Warning: verify-paystack function missing env vars')
}

const { createClient } = require('@supabase/supabase-js')
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { reference, course_id, student_id } = req.body || {}
    if (!reference || !course_id || !student_id) return res.status(400).json({ error: 'Missing parameters' })

    if (!supabaseAdmin) return res.status(500).json({ success: false, message: 'Supabase admin client not configured' })

    // 1) Verify with Paystack
    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`
    const verifyRes = await fetch(verifyUrl, { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } })
    const verifyJson = await verifyRes.json()
    if (!verifyRes.ok || verifyJson.data?.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment not successful', verifyJson })
    }

    const tx = verifyJson.data

    // 2) Idempotency: if payment with this reference already exists and succeeded, return success
    const { data: existingPayments } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('paystack_reference', reference)
      .limit(1)

    if (existingPayments && existingPayments.length > 0) {
      const p = existingPayments[0]
      if (p.status === 'success') {
        return res.status(200).json({ success: true, message: 'Already processed', payment_id: p.id })
      }
      // If payment exists but not success, we'll attempt to update it below.
    }

    // 3) Fetch course to validate amount and currency and check capacity/status
    const { data: courses, error: courseErr } = await supabaseAdmin
      .from('courses')
      .select('price, currency, status, enrollment_count, max_students, title')
      .eq('id', course_id)
      .limit(1)

    if (courseErr || !courses || courses.length === 0) {
      return res.status(400).json({ success: false, message: 'Course not found', courseErr })
    }

    const course = courses[0]
    if (course.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Course not available for enrollment' })
    }

    if (course.max_students && course.enrollment_count >= course.max_students) {
      return res.status(400).json({ success: false, message: 'Course is full' })
    }

    // Paystack returns amount in the smallest unit (e.g., kobo for NGN)
    const expectedAmountSmallestUnit = Math.round(Number(course.price || 0) * 100)
    if (Number(tx.amount) !== expectedAmountSmallestUnit) {
      return res.status(400).json({ success: false, message: 'Amount mismatch', expected: expectedAmountSmallestUnit, got: tx.amount })
    }

    if (tx.currency && tx.currency.toUpperCase() !== String(course.currency || 'NGN').toUpperCase()) {
      return res.status(400).json({ success: false, message: 'Currency mismatch', expected: course.currency, got: tx.currency })
    }

    // 4) Validate customer identity: prefer Paystack customer email, fallback to metadata.student_id
    let paystackEmail = tx.customer?.email || null
    const metadataStudentId = tx.metadata && tx.metadata.student_id ? tx.metadata.student_id : null

    if (paystackEmail) {
      const { data: users } = await supabaseAdmin.from('users').select('id,email').eq('id', student_id).limit(1)
      const user = users && users[0]
      if (!user) return res.status(400).json({ success: false, message: 'Student not found' })
      if (user.email && user.email.toLowerCase() !== paystackEmail.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'Customer email does not match student email' })
      }
    } else if (metadataStudentId) {
      if (metadataStudentId !== student_id) {
        return res.status(400).json({ success: false, message: 'Metadata student_id mismatch' })
      }
    } else {
      // No reliable customer identity provided; reject to avoid fraud
      return res.status(400).json({ success: false, message: 'Missing customer identity in Paystack transaction' })
    }

    // 5) Check for existing enrollment
    const { data: existingEnrollments } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .limit(1)

    if (existingEnrollments && existingEnrollments.length > 0) {
      const existingEnroll = existingEnrollments[0]
      if (existingEnroll.payment_status === 'completed') {
        return res.status(200).json({ success: true, message: 'Already enrolled', enrollment_id: existingEnroll.id })
      }
      // If there is a pending enrollment, we will attach payment to it below.
    }

    // 6) Create enrollment if needed (payment_status pending)
    let enrollmentId = existingEnrollments && existingEnrollments.length > 0 ? existingEnrollments[0].id : null
    if (!enrollmentId) {
      const now = new Date().toISOString()
      const { data: enrData, error: enrErr } = await supabaseAdmin
        .from('enrollments')
        .insert([
          {
            student_id,
            course_id,
            payment_status: 'pending',
            progress_percentage: 0,
            enrolled_at: now,
            created_at: now,
          },
        ])
        .select('id')
        .limit(1)

      if (enrErr || !enrData || enrData.length === 0) {
        return res.status(500).json({ success: false, message: 'Failed to create enrollment', error: enrErr })
      }
      enrollmentId = enrData[0].id
    }

    // 7) Insert or update payment record (idempotent on paystack_reference)
    const paymentPayload = {
      enrollment_id: enrollmentId,
      student_id,
      course_id,
      amount: Number(course.price || 0),
      currency: course.currency || 'NGN',
      paystack_reference: reference,
      paystack_transaction_id: tx.id || null,
      status: 'success',
      metadata: tx.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let paymentId = null
    if (existingPayments && existingPayments.length > 0) {
      // update existing payment
      const { data: updated, error: updErr } = await supabaseAdmin
        .from('payments')
        .update(paymentPayload)
        .eq('paystack_reference', reference)
        .select('id')
        .limit(1)

      if (updErr) return res.status(500).json({ success: false, message: 'Failed to update existing payment', error: updErr })
      paymentId = updated && updated[0] && updated[0].id
    } else {
      const { data: payData, error: payErr } = await supabaseAdmin
        .from('payments')
        .insert([paymentPayload])
        .select('id')
        .limit(1)

      if (payErr || !payData || payData.length === 0) return res.status(500).json({ success: false, message: 'Failed to create payment record', error: payErr })
      paymentId = payData[0].id
    }

    // 8) Update enrollment to mark completed and attach payment_id
    const { error: enrUpdateErr } = await supabaseAdmin
      .from('enrollments')
      .update({ payment_status: 'completed', payment_id: paymentId, enrolled_at: new Date().toISOString() })
      .eq('id', enrollmentId)

    if (enrUpdateErr) return res.status(500).json({ success: false, message: 'Failed to update enrollment', error: enrUpdateErr })

    // 9) Optionally: trigger any RPC to update counts exists via trigger on enrollments insert
    // Enrollment insert already triggers update_course_enrollment_count; if you rely on an RPC, call it here.

    // 10) Send confirmation email if SendGrid key present (best-effort)
    if (SENDGRID_API_KEY) {
      const { data: userRows } = await supabaseAdmin.from('users').select('email, full_name').eq('id', student_id).limit(1)
      const student = userRows && userRows[0]
      if (student && student.email) {
        const mail = {
          personalizations: [{ to: [{ email: student.email }], subject: 'Enrollment confirmed' }],
          from: { email: 'no-reply@example.com', name: APP_NAME },
          content: [{ type: 'text/plain', value: `Hi ${student.full_name || ''},\n\nYour enrollment for course ${course.title || course_id} is confirmed. Reference: ${reference}` }],
        }

        try {
          await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(mail),
          })
        } catch (e) {
          // Non-fatal: we don't want email failure to break the flow
          console.warn('SendGrid send failed', e)
        }
      }
    }

    return res.status(200).json({ success: true, payment_id: paymentId, enrollment_id: enrollmentId })
  } catch (err) {
    console.error('verify-paystack error', err)
    return res.status(500).json({ success: false, error: String(err) })
  }
}
