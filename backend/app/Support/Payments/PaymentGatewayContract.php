<?php

namespace App\Support\Payments;

interface PaymentGatewayContract
{
    /**
     * Initialize a payment and return an authorization/checkout URL.
     *
     * @return array{authorization_url:string, raw?:mixed}
     */
    public function initialize(array $payload): array;

    /**
     * Verify a payment reference.
     *
     * @return array{status:string, amount_minor?:int, currency?:string, raw?:mixed}
     */
    public function verify(string $reference): array;
}
