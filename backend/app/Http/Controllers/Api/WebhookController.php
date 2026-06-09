<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Payment;
use App\Models\User;
use App\Support\Payments\GatewayManager;
use App\Support\Payments\GatewaySettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function paystack(Request $request)
    {
        $secretKey = GatewaySettings::paystackSecretKey();
        if (!$secretKey) {
            return response()->json(['message' => 'Paystack is not configured'], 400);
        }

        $signature = $request->header('x-paystack-signature');
        $payload = $request->getContent();

        if (!$signature || $signature !== hash_hmac('sha512', $payload, $secretKey)) {
            Log::warning('Invalid Paystack webhook signature.', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        $data = $request->input('data');

        if ($event === 'charge.success' && is_array($data)) {
            $reference = $data['reference'] ?? null;
            if (!$reference) {
                return response()->json(['message' => 'No reference found in payload'], 400);
            }

            /** @var Payment|null $payment */
            $payment = Payment::query()
                ->where('reference', $reference)
                ->orWhere('paystack_reference', $reference)
                ->first();

            if (!$payment) {
                Log::info('Paystack webhook: Payment not found', ['reference' => $reference]);
                return response()->json(['message' => 'Payment not found'], 404);
            }

            // Idempotency check
            if ($payment->status === 'successful') {
                return response()->json(['message' => 'Payment already verified'], 200);
            }

            $gateway = $payment->gateway ?: $payment->payment_method ?: 'paystack';
            
            // Explicitly verify with Paystack to be absolutely secure and get the authoritative payload.
            try {
                $gatewayHandler = GatewayManager::resolve($gateway);
                $result = $gatewayHandler->verify($reference);
            } catch (\Exception $e) {
                Log::error('Paystack webhook: verification failed', ['error' => $e->getMessage()]);
                return response()->json(['message' => 'Gateway verification error'], 502);
            }

            $status = (string) ($result['status'] ?? 'failed');
            if ($status !== 'success') {
                $payment->status = 'failed';
                if ($gateway === 'paystack' && array_key_exists('raw', $result)) {
                    $payment->paystack_response = is_array($result['raw']) ? $result['raw'] : null;
                }
                $payment->save();
                return response()->json(['message' => 'Payment verification failed'], 400);
            }

            $paidMinor = (int) ($result['amount_minor'] ?? 0);
            $expectedMinor = $payment->amount_minor ?? (int) round(((float) $payment->amount) * 100);
            if ($paidMinor < (int) $expectedMinor) {
                $payment->status = 'failed';
                if ($gateway === 'paystack' && array_key_exists('raw', $result)) {
                    $payment->paystack_response = is_array($result['raw']) ? $result['raw'] : null;
                }
                $payment->save();
                return response()->json(['message' => 'Amount mismatch'], 400);
            }

            $paidCurrency = $result['currency'] ?? null;
            if (is_string($paidCurrency) && $payment->currency && strtoupper($paidCurrency) !== strtoupper((string) $payment->currency)) {
                $payment->status = 'failed';
                if ($gateway === 'paystack' && array_key_exists('raw', $result)) {
                    $payment->paystack_response = is_array($result['raw']) ? $result['raw'] : null;
                }
                $payment->save();
                return response()->json(['message' => 'Currency mismatch'], 400);
            }

            $payment->status = 'successful';
            if ($gateway === 'paystack' && array_key_exists('raw', $result)) {
                $payment->paystack_response = is_array($result['raw']) ? $result['raw'] : null;
            }
            $payment->save();

            // Find user and course
            $user = User::query()->find($payment->student_id);
            $course = Course::query()->find($payment->course_id);

            if ($user && $course) {
                PaymentController::fulfillPayment($payment, $reference, $user, $course);
            }
        }

        return response()->json(['message' => 'Webhook received']);
    }
}
