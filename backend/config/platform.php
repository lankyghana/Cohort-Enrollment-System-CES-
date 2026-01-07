<?php

return [
    // Required: set this in .env (PLATFORM_CURRENCY=...)
    'default_currency' => env('PLATFORM_CURRENCY'),

    // Optional comma-separated list (SUPPORTED_CURRENCIES=...)
    // If omitted, the API will derive a list from stored course currencies.
    'supported_currencies' => env('SUPPORTED_CURRENCIES'),

    // Optional currency aliases for backward compatibility (CURRENCY_ALIASES=...)
    'currency_aliases' => env('CURRENCY_ALIASES'),
];
