<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\EnrollmentConfirmed;
use App\Models\Course;
use App\Models\EnrollmentIntent;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use App\Support\Currency;
use App\Support\Payments\GatewayManager;
use App\Support\Payments\GatewaySettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use RuntimeException;

class PaymentController extends Controller
{
    private function issueVerifyState(Payment $payment): string
    {
        $plain = (string) Str::random(64);
        $payment->verify_token_hash = hash('sha256', $plain);
        $payment->verify_token_used_at = null;

        return $plain;
    }

    private function appendQuery(string $url, array $params): string
    {
        $sep = str_contains($url, '?') ? '&' : '?';
        return $url . $sep . http_build_query($params);
    }

    private function getEnrollmentFee(): float
    {
        $raw = Setting::getValue('enrollment_fee', '0');
        return max(0.0, (float) $raw);
    }

    private function resolveFrontendBaseUrl(Request $request): ?string
    {
        $origin = $request->headers->get('Origin');
        $allowedOrigins = config('cors.allowed_origins', []);

        if (is_string($allowedOrigins)) {
            $allowedOrigins = array_filter(array_map('trim', explode(',', $allowedOrigins)));
        }

        if (is_string($origin) && $origin !== '' && in_array($origin, $allowedOrigins, true)) {
            return rtrim($origin, '/');
        }

        $frontendUrl = trim((string) env('FRONTEND_URL', env('APP_URL')));
        if ($frontendUrl === '') {
            return null;
        }

        return rtrim($frontendUrl, '/');
    }

    public function index(Request $request)
    {
        // Payments are admin-only for this management view.
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $limit = (int) $request->query('limit', 100);
        $limit = max(1, min($limit, 500));

        $query = Payment::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $payments = $query->limit($limit)->get();

        return response()->json([
            'data' => $payments,
        ]);
    }

    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'enrollment_intent_id' => 'nullable|uuid|exists:enrollment_intents,id',
            'course_id' => 'required|uuid',
            'payment_type' => 'nullable|in:enrollment_fee,full,balance',
        ]);

        $paymentType = (string) ($validated['payment_type'] ?? 'enrollment_fee');

        // Use a transaction to reduce race conditions (double-clicks / retries).
        return DB::transaction(function () use ($request, $validated, $paymentType) {
            $intent = null;
            $user = null;

            if (! empty($validated['enrollment_intent_id'])) {
                /** @var EnrollmentIntent $intent */
                $intent = EnrollmentIntent::query()
                    ->where('id', (string) $validated['enrollment_intent_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                /** @var User $user */
                $user = User::query()->findOrFail($intent->user_id);
            } else {
                $user = $request->user();
                if (! $user) {
                    return response()->json(['message' => 'Unauthorized'], 401);
                }

                // If there's an enrollment row for this course, lock it as a mutex for payment initiation.
                DB::table('enrollments')
                    ->where('student_id', $user->id)
                    ->where('course_id', (string) $validated['course_id'])
                    ->lockForUpdate()
                    ->first();
            }

        // Onboarding initiation (intent-based) rules:
        // students without an active enrollment must be able to select a course and pay.
        if ($intent && $user->isStudent()) {
            $status = (string) ($user->status ?? 'active');
            $hasActiveEnrollment = (bool) ($user->has_active_enrollment ?? false);

            if ($status !== 'pending' && $hasActiveEnrollment) {
                return response()->json([
                    'message' => 'User is already active and enrolled.',
                ], 422);
            }

            // If the account is incomplete but not explicitly marked pending (legacy/seeded data),
            // normalize it to pending so downstream logic is consistent.
            if ($status !== 'pending' && ! $hasActiveEnrollment) {
                $user->status = 'pending';
                $user->save();
            }
        }

        // Enrollment intent must be in a resumable state.
        if ($intent && ! in_array((string) $intent->state, ['awaiting_course', 'awaiting_payment'], true)) {
            return response()->json([
                'message' => 'Enrollment intent is not available for payment.',
            ], 422);
        }

            /** @var Course $course */
            $course = Course::query()->findOrFail($validated['course_id']);
        $isPublished = (bool) ($course->published ?? false);
        if (! $isPublished && $course->status !== 'published') {
            return response()->json([
                'message' => 'Course is not available for enrollment.',
            ], 422);
        }

        $defaultCurrency = Currency::platform();
        $currency = Currency::normalize((string) ($course->currency ?: $defaultCurrency)) ?: $defaultCurrency;
        $totalPrice = (float) $course->price;

        // Compute amount to charge (backend-authoritative).
        $amount = 0.0;

        if ($paymentType === 'enrollment_fee') {
            $fee = min($this->getEnrollmentFee(), $totalPrice);
            $amount = $fee;
        } elseif ($paymentType === 'balance') {
            $existingEnrollment = DB::table('enrollments')
                ->where('student_id', $user->id)
                ->where('course_id', (string) $course->id)
                ->first(['balance_due']);

            $amount = $existingEnrollment ? (float) ($existingEnrollment->balance_due ?? 0) : 0.0;
        } else {
            // "full" means: pay the remaining balance if already partially paid; otherwise pay total.
            $existingEnrollment = DB::table('enrollments')
                ->where('student_id', $user->id)
                ->where('course_id', (string) $course->id)
                ->first(['total_price', 'amount_paid', 'balance_due']);

            if ($existingEnrollment) {
                $amount = (float) ($existingEnrollment->balance_due ?? 0);
            } else {
                $amount = $totalPrice;
            }
        }

        $amount = max(0.0, (float) $amount);
        // Always start a new payment: never resume/reuse pending payments.
        // To avoid confusing UX (and accidentally paying the wrong pending amount), we invalidate any existing pending payments.

            // Intent-based: if this intent already points at a pending payment, fail it and clear the linkage.
            if ($intent && ! empty($intent->payment_id)) {
                /** @var Payment|null $existingPayment */
                $existingPayment = Payment::query()->where('id', (string) $intent->payment_id)->lockForUpdate()->first();
                if ($existingPayment) {
                    if ($existingPayment->status === 'pending') {
                        $existingPayment->status = 'failed';
                        $existingPayment->save();
                    }

                    $intent->payment_id = null;
                    $intent->save();
                }
            }

            // Authenticated flow: fail any pending payments for this user+course so we always start new.
            if (! $intent) {
                Payment::query()
                    ->where('student_id', $user->id)
                    ->where('course_id', $course->id)
                    ->where('status', 'pending')
                    ->lockForUpdate()
                    ->update(['status' => 'failed']);
            }

        // Backend resolves active gateway from admin configuration (DB/env).
        $gatewayName = strtolower(trim(GatewaySettings::activeGateway()));
        $reference = (string) Str::uuid();

        if ($amount <= 0) {
            return response()->json([
                'message' => 'There is no payable amount for this enrollment.',
            ], 422);
        }

            $payment = new Payment();
        $payment->id = (string) Str::uuid();
        $payment->student_id = $user->id;
        $payment->course_id = $course->id;
        $payment->amount = (float) $amount;
        $payment->currency = $currency;
        $payment->status = 'pending';
        $payment->payment_method = $gatewayName;
        $payment->paystack_reference = $reference;
        $payment->reference = $reference;
        $payment->gateway = $gatewayName;
        $payment->payment_type = $paymentType;

        $amountMinor = (int) round(((float) $payment->amount) * 100);
        $payment->amount_minor = $amountMinor;

        $paymentUrl = null;

            try {
            $frontendUrl = $this->resolveFrontendBaseUrl($request);
            if (! $frontendUrl) {
                return response()->json(['message' => 'FRONTEND_URL is not configured.'], 500);
            }

            // Protect verify(): include a server-generated state token in the callback URL.
            $state = $this->issueVerifyState($payment);
            $callbackUrl = $this->appendQuery($frontendUrl . '/enrollment-success', ['state' => $state]);

            $metadata = [
                'course_id' => (string) $course->id,
                'user_id' => (string) $user->id,
            ];

            if ($intent) {
                $metadata['enrollment_intent_id'] = (string) $intent->id;
            }

            $gatewayHandler = GatewayManager::resolve($gatewayName);
            $result = $gatewayHandler->initialize([
                'email' => $user->email,
                'amount' => $amountMinor,
                'currency' => $payment->currency,
                'reference' => $reference,
                'callback_url' => $callbackUrl,
                'metadata' => $metadata,
            ]);

            $paymentUrl = $result['authorization_url'] ?? null;
            if ($gatewayName === 'paystack' && array_key_exists('raw', $result)) {
                $payment->paystack_response = is_array($result['raw']) ? $result['raw'] : null;
            }
        } catch (RuntimeException $e) {
            $status = $gatewayName === 'bulkclix' ? 501 : 502;
            return response()->json([
                'message' => $e->getMessage(),
            ], $status);
        }

        if (! $paymentUrl) {
            return response()->json([
                'message' => 'Payment URL was not generated.',
            ], 502);
        }

            $payment->payment_url = $paymentUrl;
            $payment->save();

        // Persist selected course + payment linkage for resume-safe onboarding.
            if ($intent) {
                $intent->state = 'awaiting_payment';
                $intent->course_id = (string) $course->id;
                $intent->payment_id = (string) $payment->id;
                $intent->reference = (string) $reference;
                $intent->save();
            }

            return response()->json([
                'authorization_url' => $paymentUrl,
                'payment_url' => $paymentUrl,
            ]);
        });
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'enrollment_intent_id' => 'nullable|uuid|exists:enrollment_intents,id',
        ]);

        $reference = $validated['reference'];

        /** @var Payment|null $payment */
        $payment = Payment::query()
            ->where('reference', $reference)
            ->orWhere('paystack_reference', $reference)
            ->first();

        if (! $payment) {
            return response()->json(['message' => 'Payment reference not found.'], 404);
        }

        // Ownership & anti-token-minting guard.
        /** @var User|null $authUser */
        $authUser = $request->user();
        if ($authUser) {
            if ((int) $authUser->id !== (int) $payment->student_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } else {
            $state = (string) ($validated['state'] ?? '');

            // New flow: require state token and ensure it's not reused.
            if (! empty($payment->verify_token_hash)) {
                if ($state === '' || ! hash_equals((string) $payment->verify_token_hash, hash('sha256', $state))) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }

                if (! empty($payment->verify_token_used_at)) {
                    return response()->json([
                        'code' => 'VERIFY_LINK_USED',
                        'message' => 'This verification link was already used. Please log in to continue.',
                    ], 409);
                }
            } else {
                // Legacy fallback: allow verification only if caller proves knowledge of the enrollment intent.
                $intentId = (string) ($validated['enrollment_intent_id'] ?? '');
                if ($intentId === '') {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }

                /** @var EnrollmentIntent $intent */
                $intent = EnrollmentIntent::query()->findOrFail($intentId);
                $intentMatches = (int) $intent->user_id === (int) $payment->student_id && (string) $intent->reference === (string) $reference;
                if (! $intentMatches) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            }
        }

        $gateway = $payment->gateway ?: $payment->payment_method ?: 'paystack';

        if ($payment->status !== 'successful') {
            try {
                $gatewayHandler = GatewayManager::resolve($gateway);
                $result = $gatewayHandler->verify($reference);
            } catch (RuntimeException $e) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 501);
            }

            $status = (string) ($result['status'] ?? 'failed');
            if ($status !== 'success') {
                $payment->status = 'failed';
                if ($gateway === 'paystack' && array_key_exists('raw', $result)) {
                    $payment->paystack_response = is_array($result['raw']) ? $result['raw'] : null;
                }
                $payment->save();

                return response()->json([
                    'message' => 'Payment verification failed.',
                ], 402);
            }

            $paidMinor = (int) ($result['amount_minor'] ?? 0);
            $expectedMinor = $payment->amount_minor ?? (int) round(((float) $payment->amount) * 100);
            if ($paidMinor < (int) $expectedMinor) {
                $payment->status = 'failed';
                if ($gateway === 'paystack' && array_key_exists('raw', $result)) {
                    $payment->paystack_response = is_array($result['raw']) ? $result['raw'] : null;
                }
                $payment->save();

                return response()->json([
                    'message' => 'Payment amount mismatch.',
                ], 402);
            }

            $paidCurrency = $result['currency'] ?? null;
            if (is_string($paidCurrency) && $payment->currency && strtoupper($paidCurrency) !== strtoupper((string) $payment->currency)) {
                $payment->status = 'failed';
                if ($gateway === 'paystack' && array_key_exists('raw', $result)) {
                    $payment->paystack_response = is_array($result['raw']) ? $result['raw'] : null;
                }
                $payment->save();

                return response()->json([
                    'message' => 'Payment currency mismatch.',
                ], 402);
            }

            $payment->status = 'successful';
            if ($gateway === 'paystack' && array_key_exists('raw', $result)) {
                $payment->paystack_response = is_array($result['raw']) ? $result['raw'] : null;
            }
            $payment->save();
        }

        $user = User::query()->find($payment->student_id);
        if (! $user) {
            return response()->json(['message' => 'User not found for payment.'], 404);
        }

        $course = Course::query()->find($payment->course_id);
        if (! $course) {
            return response()->json(['message' => 'Course not found for payment.'], 404);
        }

        DB::transaction(function () use ($payment, $user, $course, $reference) {
            $existing = DB::table('enrollments')
                ->where('student_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            $totalPrice = $existing && isset($existing->total_price)
                ? (float) $existing->total_price
                : (float) $course->price;

            // Recompute paid amount from authoritative successful payments to avoid double-counting
            // when verify() is called multiple times for the same reference.
            $totalPaid = (float) Payment::query()
                ->where('student_id', $user->id)
                ->where('course_id', $course->id)
                ->where('status', 'successful')
                ->sum('amount');

            $balanceDue = max(0.0, $totalPrice - $totalPaid);
            $isPaidInFull = $balanceDue <= 0.0;

            $deadline = null;
            if ($existing && isset($existing->payment_deadline) && $existing->payment_deadline) {
                $deadline = $existing->payment_deadline;
            } elseif ($course->start_date) {
                $deadline = $course->start_date;
            }

            $isLocked = $balanceDue > 0 && $deadline && now()->greaterThanOrEqualTo($deadline);

            if (! $existing) {
                DB::table('enrollments')->insert([
                    'id' => (string) Str::uuid(),
                    'student_id' => $user->id,
                    'course_id' => (string) $course->id,
                    'payment_id' => (string) $payment->id,
                    'enrolled_at' => now(),
                    'payment_status' => $isPaidInFull ? 'paid' : 'pending',
                    'amount_paid' => $totalPaid,
                    'total_price' => $totalPrice,
                    'balance_due' => $balanceDue,
                    'payment_deadline' => $deadline,
                    'access_locked' => $isLocked,
                    'confirmation_sent_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('enrollments')
                    ->where('id', $existing->id)
                    ->update([
                        'payment_status' => $isPaidInFull ? 'paid' : 'pending',
                        'amount_paid' => $totalPaid,
                        'total_price' => $totalPrice,
                        'balance_due' => $balanceDue,
                        'payment_deadline' => $deadline,
                        'access_locked' => $isLocked,
                        'payment_id' => (string) ($payment->id),
                        'updated_at' => now(),
                    ]);
            }

            $user->status = 'active';
            $user->has_active_enrollment = true;
            $user->save();

            // Mark the newest matching enrollment intent completed (resume-safe).
            $intent = EnrollmentIntent::query()
                ->where('user_id', $user->id)
                ->whereIn('state', ['awaiting_course', 'awaiting_payment'])
                ->where(function ($q) use ($course, $payment, $reference) {
                    $q->where('course_id', (string) $course->id)
                        ->orWhereNull('course_id');

                    $q->orWhere('payment_id', (string) $payment->id)
                        ->orWhere('reference', (string) $reference);
                })
                ->latest('created_at')
                ->first();

            if ($intent) {
                $intent->state = 'completed';
                $intent->course_id = (string) $course->id;
                $intent->payment_id = (string) $payment->id;
                $intent->reference = (string) $reference;
                $intent->save();
            }
        });

        $enrollmentRow = DB::table('enrollments')
            ->where('student_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($enrollmentRow && empty($enrollmentRow->confirmation_sent_at)) {
            Mail::to($user->email)->queue(new EnrollmentConfirmed(
                courseName: (string) $course->title,
                startDate: $course->start_date ? (string) $course->start_date : null,
            ));

            DB::table('enrollments')->where('id', $enrollmentRow->id)->update([
                'confirmation_sent_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Only mint a new token for unauthenticated verification flows.
        $token = null;
        if (! $authUser) {
            $payment->verify_token_used_at = now();
            $payment->save();

            $token = $user->createToken('auth_token')->plainTextToken;
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
            'course' => [
                'id' => (string) $course->id,
                'start_date' => $course->start_date ? $course->start_date->toISOString() : null,
            ],
        ]);
    }
}
