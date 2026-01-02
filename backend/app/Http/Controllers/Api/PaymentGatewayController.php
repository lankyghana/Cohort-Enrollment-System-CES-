<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\EnvEditor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class PaymentGatewayController extends Controller
{
    public function show(Request $request)
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => [
                'active_gateway' => env('PAYMENT_GATEWAY', 'paystack'),
                'paystack_public_key' => env('PAYSTACK_PUBLIC_KEY', ''),
                'paystack_secret_key_set' => (bool) env('PAYSTACK_SECRET_KEY'),
                'bulkclix_base_url' => env('BULKCLIX_BASE_URL', 'https://api.bulkclix.com'),
                'bulkclix_api_key_set' => (bool) env('BULKCLIX_API_KEY'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'active_gateway' => 'required|in:paystack,bulkclix',
            'paystack_public_key' => 'sometimes|nullable|string|max:255',
            'paystack_secret_key' => 'sometimes|nullable|string|max:255',
            'bulkclix_base_url' => 'sometimes|nullable|url|max:255',
            'bulkclix_api_key' => 'sometimes|nullable|string|max:255',
        ]);

        $updates = [
            'PAYMENT_GATEWAY' => $validated['active_gateway'],
        ];

        // Only overwrite secrets when explicitly provided and non-empty.
        if (array_key_exists('paystack_public_key', $validated) && filled($validated['paystack_public_key'])) {
            $updates['PAYSTACK_PUBLIC_KEY'] = $validated['paystack_public_key'];
        }
        if (array_key_exists('paystack_secret_key', $validated) && filled($validated['paystack_secret_key'])) {
            $updates['PAYSTACK_SECRET_KEY'] = $validated['paystack_secret_key'];
        }
        if (array_key_exists('bulkclix_base_url', $validated) && filled($validated['bulkclix_base_url'])) {
            $updates['BULKCLIX_BASE_URL'] = $validated['bulkclix_base_url'];
        }
        if (array_key_exists('bulkclix_api_key', $validated) && filled($validated['bulkclix_api_key'])) {
            $updates['BULKCLIX_API_KEY'] = $validated['bulkclix_api_key'];
        }

        // Validate that the chosen gateway has credentials (either already in env or in this update).
        $active = $validated['active_gateway'];
        if ($active === 'paystack') {
            $pub = $updates['PAYSTACK_PUBLIC_KEY'] ?? env('PAYSTACK_PUBLIC_KEY');
            $sec = $updates['PAYSTACK_SECRET_KEY'] ?? env('PAYSTACK_SECRET_KEY');

            if (! $pub || ! $sec) {
                throw ValidationException::withMessages([
                    'active_gateway' => 'Paystack is selected but PAYSTACK_PUBLIC_KEY/PAYSTACK_SECRET_KEY are missing.',
                ]);
            }
        }

        if ($active === 'bulkclix') {
            $baseUrl = $updates['BULKCLIX_BASE_URL'] ?? env('BULKCLIX_BASE_URL', 'https://api.bulkclix.com');
            $apiKey = $updates['BULKCLIX_API_KEY'] ?? env('BULKCLIX_API_KEY');

            if (! $baseUrl || ! $apiKey) {
                throw ValidationException::withMessages([
                    'active_gateway' => 'Bulkclix is selected but BULKCLIX_BASE_URL/BULKCLIX_API_KEY are missing.',
                ]);
            }
        }

        try {
            EnvEditor::update($updates);

            // If config is cached, clear so env changes take effect.
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }

        return $this->show($request);
    }
}
