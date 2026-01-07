<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Setting;
use App\Support\Currency;
use Illuminate\Http\Request;

class PlatformSettingsController extends Controller
{
    private const KEY_CURRENCY = 'platform_currency';

    /**
     * Public: safe subset of platform settings.
     */
    public function show()
    {
        $stored = Setting::getValue(self::KEY_CURRENCY);
        $currency = Currency::normalize(is_string($stored) ? $stored : null);

        if (! $currency) {
            // If not set yet, seed from env (preferred) or from existing course data.
            $seed = Currency::normalize((string) config('platform.default_currency'));
            if (! $seed) {
                $seed = Currency::normalize((string) Course::query()->whereNotNull('currency')->value('currency'));
            }
            if (! $seed) {
                return response()->json([
                    'message' => 'Platform currency is not configured. Set PLATFORM_CURRENCY or update platform settings.',
                ], 500);
            }

            Setting::setValue(self::KEY_CURRENCY, $seed);
            $currency = $seed;
        }

        $supported = Currency::supported();
        if (empty($supported)) {
            // Derive a stable list from stored course currencies plus platform currency.
            $derived = Course::query()
                ->select('currency')
                ->whereNotNull('currency')
                ->distinct()
                ->pluck('currency')
                ->map(fn ($c) => Currency::normalize((string) $c))
                ->filter()
                ->values()
                ->all();
            $supported = array_values(array_unique(array_merge([$currency], $derived)));
        }

        return response()->json([
            'currency' => $currency,
            'supported_currencies' => $supported,
            'currency_aliases' => Currency::aliases(),
        ]);
    }

    /**
     * Admin-only: update platform currency.
     */
    public function updateCurrency(Request $request)
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'currency' => [
                'required',
                'string',
                'size:3',
                'regex:/^[A-Za-z]{3}$/',
            ],
        ]);

        $currency = Currency::normalize((string) $validated['currency']);
        if (! $currency) {
            return response()->json(['message' => 'Invalid currency code.'], 422);
        }

        $supported = Currency::supported();
        if (! empty($supported) && ! in_array($currency, $supported, true)) {
            return response()->json(['message' => 'Unsupported currency.'], 422);
        }

        Setting::setValue(self::KEY_CURRENCY, $currency);

        return $this->show();
    }
}
