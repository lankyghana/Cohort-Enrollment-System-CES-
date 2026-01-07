<?php

namespace App\Support\Payments;

use App\Models\Setting;

class GatewaySettings
{
    public const KEY_ACTIVE_GATEWAY = 'payment_active_gateway';
    public const KEY_PAYSTACK_PUBLIC = 'paystack_public_key';
    public const KEY_PAYSTACK_SECRET = 'paystack_secret_key';
    public const KEY_BULKCLIX_BASE_URL = 'bulkclix_base_url';
    public const KEY_BULKCLIX_API_KEY = 'bulkclix_api_key';

    public static function activeGateway(): string
    {
        $fromDb = Setting::getValue(self::KEY_ACTIVE_GATEWAY);
        $fromDb = is_string($fromDb) ? trim($fromDb) : '';

        if ($fromDb !== '') {
            return $fromDb;
        }

        return (string) env('PAYMENT_GATEWAY', 'paystack');
    }

    public static function paystackPublicKey(): string
    {
        $fromDb = Setting::getValue(self::KEY_PAYSTACK_PUBLIC);
        if (is_string($fromDb) && trim($fromDb) !== '') {
            return trim($fromDb);
        }

        return (string) env('PAYSTACK_PUBLIC_KEY', '');
    }

    public static function paystackSecretKey(): string
    {
        $fromDb = Setting::getValue(self::KEY_PAYSTACK_SECRET);
        if (is_string($fromDb) && trim($fromDb) !== '') {
            return trim($fromDb);
        }

        return (string) env('PAYSTACK_SECRET_KEY', '');
    }

    public static function bulkclixBaseUrl(): string
    {
        $fromDb = Setting::getValue(self::KEY_BULKCLIX_BASE_URL);
        if (is_string($fromDb) && trim($fromDb) !== '') {
            return trim($fromDb);
        }

        return (string) env('BULKCLIX_BASE_URL', 'https://api.bulkclix.com');
    }

    public static function bulkclixApiKey(): string
    {
        $fromDb = Setting::getValue(self::KEY_BULKCLIX_API_KEY);
        if (is_string($fromDb) && trim($fromDb) !== '') {
            return trim($fromDb);
        }

        return (string) env('BULKCLIX_API_KEY', '');
    }
}
