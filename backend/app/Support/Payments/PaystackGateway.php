<?php

namespace App\Support\Payments;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class PaystackGateway implements PaymentGatewayContract
{
    public function __construct(private readonly string $secretKey)
    {
    }

    public function initialize(array $payload): array
    {
        if (! $this->secretKey) {
            throw new RuntimeException('Paystack is not configured.');
        }

        $resp = Http::withToken($this->secretKey)
            ->acceptJson()
            ->post('https://api.paystack.co/transaction/initialize', $payload);

        $data = $resp->json();
        if (! $resp->successful() || ! is_array($data) || ! ($data['status'] ?? false)) {
            throw new RuntimeException('Unable to initialize payment.');
        }

        $url = $data['data']['authorization_url'] ?? null;
        if (! is_string($url) || $url === '') {
            throw new RuntimeException('Payment URL was not generated.');
        }

        return [
            'authorization_url' => $url,
            'raw' => $data,
        ];
    }

    public function verify(string $reference): array
    {
        if (! $this->secretKey) {
            throw new RuntimeException('Paystack is not configured.');
        }

        $resp = Http::withToken($this->secretKey)
            ->acceptJson()
            ->get('https://api.paystack.co/transaction/verify/' . urlencode($reference));

        $data = $resp->json();
        $ok = $resp->successful() && is_array($data) && ($data['status'] ?? false);
        $status = $ok ? ($data['data']['status'] ?? null) : null;

        $amountMinor = $ok ? (int) ($data['data']['amount'] ?? 0) : null;
        $currency = $ok ? ($data['data']['currency'] ?? null) : null;

        return [
            'status' => is_string($status) ? $status : 'failed',
            'amount_minor' => is_int($amountMinor) ? $amountMinor : null,
            'currency' => is_string($currency) ? $currency : null,
            'raw' => is_array($data) ? $data : null,
        ];
    }
}
