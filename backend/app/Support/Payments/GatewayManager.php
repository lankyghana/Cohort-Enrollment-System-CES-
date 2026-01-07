<?php

namespace App\Support\Payments;

use RuntimeException;

class GatewayManager
{
    public static function resolveActive(): PaymentGatewayContract
    {
        return self::resolve(GatewaySettings::activeGateway());
    }

    public static function resolve(string $gateway): PaymentGatewayContract
    {
        $gateway = strtolower(trim($gateway));

        return match ($gateway) {
            'paystack' => new PaystackGateway(GatewaySettings::paystackSecretKey()),
            'bulkclix' => new BulkclixGateway(GatewaySettings::bulkclixBaseUrl(), GatewaySettings::bulkclixApiKey()),
            default => throw new RuntimeException('Unsupported payment gateway.'),
        };
    }
}
