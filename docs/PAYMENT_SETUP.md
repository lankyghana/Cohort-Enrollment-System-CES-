# Payment & Paystack setup

This document explains how to deploy the Paystack verification Edge Function, what secrets are required, and how the enrollment flow works.

## Overview

- Client (browser) opens Paystack inline widget using `VITE_PAYSTACK_PUBLIC_KEY`.
- After successful payment, the client calls the Edge Function `/verify-paystack` with the reference.
- Edge Function verifies the transaction with Paystack (server-side), creates an `enrollments` row in Supabase using the service role key, optionally increments the course enrollment count, and sends a confirmation email via SendGrid.

## Required environment variables (Edge function)

- `SUPABASE_URL` - your Supabase project URL (e.g. `https://yourproject.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service_role key (keep secret)
- `PAYSTACK_SECRET_KEY` - Paystack secret key (server-side only)
- `SENDGRID_API_KEY` (optional) - SendGrid API key to send confirmation emails

Set these as secrets in your Supabase project or in your hosting platform for the Edge Function.

## Client-side env vars (frontend)

- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key (used client-side)
- `VITE_SUPABASE_FUNCTIONS_URL` - base URL for your functions endpoint (e.g. `https://<project>.functions.supabase.co`)

## Deploying the Edge Function

1. Place the `verify-paystack` function in your Supabase functions directory (already in `supabase/functions/verify-paystack/index.js`).
2. Use the Supabase CLI to deploy the function: `supabase functions deploy verify-paystack --project-ref <project-ref>` and set the required secrets via `supabase secrets set ...`.
3. Ensure the function is accessible at `https://<project>.functions.supabase.co/verify-paystack` and that the function accepts POST with JSON body `{ reference, course_id, student_id }`.

## Security notes

- Never expose `PAYSTACK_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in frontend code or public repos.
- Use the service role key only in trusted server/runtime environments (Edge Functions, server-side code).

## Troubleshooting

- If verification fails, check the Paystack dashboard and the function logs. Ensure the Paystack secret key is correct.
- If enrollment creation fails, verify your table schema and that the service role key has permissions.

## Hardening applied by the project

- The verification function now performs server-side validation of the Paystack transaction:
	- Confirms the Paystack transaction status is `success`.
	- Validates the paid amount matches the course price (Paystack reports amount in the smallest unit — e.g. kobo; function converts to major unit for comparison).
	- Validates currency matches the course currency.
	- Validates the customer identity by comparing the Paystack customer email to the student's email (when available) or by checking `tx.metadata.student_id`.
	- Implements idempotency: the function checks `payments.paystack_reference` and will not double-insert an already-successful payment.
	- Creates (or reuses) a pending `enrollments` row, inserts/updates a `payments` row, then sets enrollment `payment_status` to `completed` and attaches `payment_id`.

These changes are in `supabase/functions/verify-paystack/index.js`.

## Recommended DB hardening and migrations

The repository's `supabase/schema.sql` already defines `payments.paystack_reference` as UNIQUE and creates useful indexes. Recommended additional measures (apply via migration):

1) Ensure `payments.paystack_reference` is unique (idempotency):

```sql
ALTER TABLE public.payments
	ADD CONSTRAINT payments_paystack_reference_unique UNIQUE (paystack_reference);
```

2) (Optional) Avoid circular FK issues: the current schema has `enrollments.payment_id` and `payments.enrollment_id` references which can be awkward for transactional inserts. A safe pattern is:

- Create the `enrollments` row first (payment_status='pending'),
- Insert the `payments` row with `enrollment_id` set,
- Update `enrollments.payment_id` to the new payment id and set `payment_status='completed'.`

3) Stronger guarantee (recommended): create a DB-side stored procedure that performs the above steps inside a single transaction and exposes a single RPC endpoint for the Edge Function to call. Example skeleton:

```sql
CREATE OR REPLACE FUNCTION public.process_paystack_payment(
	p_student_id uuid,
	p_course_id uuid,
	p_paystack_reference text,
	p_amount numeric,
	p_currency text,
	p_metadata jsonb
) RETURNS TABLE(enrollment_id uuid, payment_id uuid) AS $$
DECLARE
	v_enrollment_id uuid;
	v_payment_id uuid;
BEGIN
	-- Check existing payment
	SELECT id INTO v_payment_id FROM public.payments WHERE paystack_reference = p_paystack_reference LIMIT 1;
	IF v_payment_id IS NOT NULL THEN
		RETURN QUERY SELECT e.id, v_payment_id FROM public.enrollments e WHERE e.payment_id = v_payment_id LIMIT 1;
		RETURN;
	END IF;

	-- Create or get enrollment
	INSERT INTO public.enrollments(student_id, course_id, payment_status, progress_percentage, enrolled_at, created_at)
		VALUES (p_student_id, p_course_id, 'pending', 0, now(), now())
		ON CONFLICT (student_id, course_id) DO UPDATE SET updated_at = now()
		RETURNING id INTO v_enrollment_id;

	-- Insert payment and attach
	INSERT INTO public.payments(enrollment_id, student_id, course_id, amount, currency, paystack_reference, status, metadata, created_at, updated_at)
		VALUES (v_enrollment_id, p_student_id, p_course_id, p_amount, p_currency, p_paystack_reference, 'success', p_metadata, now(), now())
		RETURNING id INTO v_payment_id;

	UPDATE public.enrollments SET payment_id = v_payment_id, payment_status = 'completed', enrolled_at = now() WHERE id = v_enrollment_id;

	RETURN QUERY SELECT v_enrollment_id, v_payment_id;
END;
$$ LANGUAGE plpgsql;
```

Call this RPC from the Edge Function instead of executing multiple separate queries when you want full transactional safety.

## Testing notes

- To test in Paystack's sandbox, create a test transaction that includes either the customer's email (matching the Supabase user email) or add `metadata.student_id` to the transaction payload so the verification function can match the student.
- The `tools/test-verify-paystack.js` helper can POST references to the function URL, but it cannot simulate Paystack responses — use Paystack test transactions or deploy a local mock Paystack endpoint if you need offline testing.

## Next steps

- (Optional) Implement the `process_paystack_payment` RPC in your DB and change `verify-paystack` to call it for full transactional processing.
- Add monitoring/alerts on the Edge Function logs to detect repeated failed verification attempts (potential fraud attempts).

