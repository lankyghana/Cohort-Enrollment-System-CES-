<?php

namespace App\Support\Payments;

use RuntimeException;

class BulkclixGateway implements PaymentGatewayContract
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $apiKey,
    ) {
    }

    public function initialize(array $payload): array
    {
        throw new RuntimeException('Bulkclix payment initialization is not configured on the server.');
    }

    public function verify(string $reference): array
    {
        throw new RuntimeException('Unsupported payment gateway verification.');
    }
}
