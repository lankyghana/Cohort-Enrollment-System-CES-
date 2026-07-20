<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    private const CACHE_KEY = 'settings.all';

    public static function getValue(string $key, ?string $default = null): ?string
    {
        $settings = self::cachedMap();

        if (! array_key_exists($key, $settings) || $settings[$key] === null) {
            return $default;
        }

        return (string) $settings[$key];
    }

    public static function setValue(string $key, ?string $value): void
    {
        self::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * All settings as a [key => value] map, cached until the next write.
     *
     * @return array<string, string|null>
     */
    private static function cachedMap(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return self::query()->pluck('value', 'key')->all();
        });
    }
}
