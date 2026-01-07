<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\EnvEditor;
use App\Support\Payments\GatewaySettings;
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

        $active = GatewaySettings::activeGateway();
        $paystackPublic = GatewaySettings::paystackPublicKey();
        $paystackSecret = GatewaySettings::paystackSecretKey();
        $bulkclixBaseUrl = GatewaySettings::bulkclixBaseUrl();
        $bulkclixApiKey = GatewaySettings::bulkclixApiKey();

        return response()->json([
            'data' => [
                'active_gateway' => $active,
                'paystack_public_key' => $paystackPublic,
                'paystack_secret_key_set' => (bool) $paystackSecret,
                'bulkclix_base_url' => $bulkclixBaseUrl,
                'bulkclix_api_key_set' => (bool) $bulkclixApiKey,
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

        if ($validated['active_gateway'] === 'bulkclix') {
            throw ValidationException::withMessages([
                'active_gateway' => 'Bulkclix is not supported yet. Please use Paystack.',
            ]);
        }

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
            $pub = $validated['paystack_public_key'] ?? GatewaySettings::paystackPublicKey();
            $sec = $validated['paystack_secret_key'] ?? GatewaySettings::paystackSecretKey();

            if (! $pub || ! $sec) {
                throw ValidationException::withMessages([
                    'active_gateway' => 'Paystack is selected but PAYSTACK_PUBLIC_KEY/PAYSTACK_SECRET_KEY are missing.',
                ]);
            }
        }

        if ($active === 'bulkclix') {
            $baseUrl = $validated['bulkclix_base_url'] ?? GatewaySettings::bulkclixBaseUrl();
            $apiKey = $validated['bulkclix_api_key'] ?? GatewaySettings::bulkclixApiKey();

            if (! $baseUrl || ! $apiKey) {
                throw ValidationException::withMessages([
                    'active_gateway' => 'Bulkclix is selected but BULKCLIX_BASE_URL/BULKCLIX_API_KEY are missing.',
                ]);
            }
        }

        // Persist admin-configured gateway settings in DB (takes precedence over env).
        Setting::setValue(GatewaySettings::KEY_ACTIVE_GATEWAY, $validated['active_gateway']);

        if (array_key_exists('paystack_public_key', $validated) && filled($validated['paystack_public_key'])) {
            Setting::setValue(GatewaySettings::KEY_PAYSTACK_PUBLIC, (string) $validated['paystack_public_key']);
        }
        if (array_key_exists('paystack_secret_key', $validated) && filled($validated['paystack_secret_key'])) {
            Setting::setValue(GatewaySettings::KEY_PAYSTACK_SECRET, (string) $validated['paystack_secret_key']);
        }
        if (array_key_exists('bulkclix_base_url', $validated) && filled($validated['bulkclix_base_url'])) {
            Setting::setValue(GatewaySettings::KEY_BULKCLIX_BASE_URL, (string) $validated['bulkclix_base_url']);
        }
        if (array_key_exists('bulkclix_api_key', $validated) && filled($validated['bulkclix_api_key'])) {
            Setting::setValue(GatewaySettings::KEY_BULKCLIX_API_KEY, (string) $validated['bulkclix_api_key']);
        }

        try {
            // Keep env in sync when possible, but DB settings remain the source of truth.
            EnvEditor::update($updates);

            // If config is cached, clear so env changes take effect.
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
        } catch (RuntimeException $e) {
            // Env writes can fail in some environments; DB settings are already saved.
            // Return current state anyway.
            return $this->show($request);
        }

        return $this->show($request);
    }
}
