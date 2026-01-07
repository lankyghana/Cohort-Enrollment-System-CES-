<?php

namespace App\Support;

use App\Models\Setting;

class Currency
{
    public static function aliases(): array
    {
        $raw = (string) config('platform.currency_aliases');
        $raw = trim($raw);
        if ($raw === '') {
            return [];
        }

        $pairs = preg_split('/\s*,\s*/', $raw) ?: [];
        $out = [];

        foreach ($pairs as $pair) {
            if ($pair === '') {
                continue;
            }

            $parts = explode('=', $pair, 2);
            if (count($parts) !== 2) {
                continue;
            }

            $from = strtoupper(trim((string) $parts[0]));
            $to = strtoupper(trim((string) $parts[1]));

            if (preg_match('/^[A-Z]{3}$/', $from) && preg_match('/^[A-Z]{3}$/', $to)) {
                $out[$from] = $to;
            }
        }

        return $out;
    }

    public static function normalize(?string $currency): ?string
    {
        $c = strtoupper(trim((string) ($currency ?? '')));
        if ($c === '' || ! preg_match('/^[A-Z]{3}$/', $c)) {
            return null;
        }

        $aliases = self::aliases();
        return $aliases[$c] ?? $c;
    }

    /**
     * Returns the platform currency from DB settings or env.
     *
     * @throws \RuntimeException if not configured.
     */
    public static function platform(): string
    {
        $fromDb = Setting::getValue('currency') ?: Setting::getValue('platform_currency');
        $candidate = $fromDb ?: (string) config('platform.default_currency');
        $normalized = self::normalize($candidate);

        if (! $normalized) {
            throw new \RuntimeException('Platform currency is not configured. Set PLATFORM_CURRENCY or update platform settings.');
        }

        return $normalized;
    }

    /**
     * Returns supported currencies from env (if provided).
     * Empty array means "no explicit allow-list".
     */
    public static function supported(): array
    {
        $raw = (string) config('platform.supported_currencies');
        $raw = trim($raw);
        if ($raw === '') {
            return [];
        }

        $items = preg_split('/\s*,\s*/', $raw) ?: [];
        $out = [];
        foreach ($items as $item) {
            $norm = self::normalize($item);
            if ($norm) {
                $out[$norm] = true;
            }
        }

        return array_keys($out);
    }
}
