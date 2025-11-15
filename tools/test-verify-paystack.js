#!/usr/bin/env node
/* eslint-disable */
// @ts-nocheck
/*
 Simple test script to POST a Paystack reference to the verify-paystack
 Edge Function. Use this to simulate the client calling the verification
 endpoint after a (test) Paystack payment.

 Usage (PowerShell):
   node .\tools\test-verify-paystack.js --reference REF --course COURSE_ID --student STUDENT_ID [--url FUNCTION_URL]

 Environment fallbacks:
   - SUPABASE_FUNCTIONS_URL or VERIFY_URL can be used instead of --url

 Note: Make sure your local Supabase Functions emulator is running (if
 you are testing locally) or that the function is deployed and accessible.
*/

const args = require('minimist')(process.argv.slice(2))

const reference = args.reference || args.ref || process.env.PAYSTACK_TEST_REF || ''
const course_id = args.course || process.env.TEST_COURSE_ID || ''
const student_id = args.student || process.env.TEST_STUDENT_ID || ''
const metadataRaw = args.metadata || process.env.TEST_METADATA || ''
let metadata = null
if (metadataRaw) {
  try {
    metadata = typeof metadataRaw === 'string' ? JSON.parse(metadataRaw) : metadataRaw
  } catch (e) {
    console.warn('Failed to parse --metadata as JSON, sending raw string')
    metadata = metadataRaw
  }
}
const url =
  args.url || process.env.SUPABASE_FUNCTIONS_URL || process.env.VERIFY_URL || 'http://localhost:54321/functions/v1/verify-paystack'

if (!reference || !course_id || !student_id) {
  console.error('Missing required parameters. Example:')
  console.error('  node tools/test-verify-paystack.js --reference REF --course COURSE_ID --student STUDENT_ID')
  process.exit(1)
}

;(async () => {
  try {
    console.log(`Posting to ${url}`)
    const body = { reference, course_id, student_id }
    if (metadata) body.metadata = metadata

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const text = await res.text()
    console.log('Status:', res.status)
    try {
      const json = JSON.parse(text)
      console.log('Response JSON:', JSON.stringify(json, null, 2))
    } catch (e) {
      console.log('Response Text:', text)
    }
  } catch (err) {
    console.error('Request failed:', err)
    process.exit(2)
  }
})()
