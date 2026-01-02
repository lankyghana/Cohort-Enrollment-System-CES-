<?php

namespace App\Support;

use RuntimeException;

class EnvEditor
{
    /**
     * @param  array<string, string>  $updates
     */
    public static function update(array $updates, ?string $envPath = null): void
    {
        $path = $envPath ?: base_path('.env');

        if (! file_exists($path)) {
            throw new RuntimeException(".env file not found at: {$path}");
        }

        if (! is_writable($path)) {
            throw new RuntimeException(".env file is not writable at: {$path}");
        }

        $contents = file_get_contents($path);
        if ($contents === false) {
            throw new RuntimeException("Unable to read .env file at: {$path}");
        }

        // Normalize line endings for consistent regex operations.
        $contents = str_replace("\r\n", "\n", $contents);

        foreach ($updates as $key => $value) {
            $key = trim($key);
            if ($key === '') {
                continue;
            }

            $line = $key.'='.self::formatValue($value);
            $pattern = '/^'.preg_quote($key, '/').'=.*/m';

            if (preg_match($pattern, $contents) === 1) {
                $contents = preg_replace($pattern, $line, $contents) ?? $contents;
            } else {
                $contents = rtrim($contents, "\n");
                $contents .= "\n".$line."\n";
            }
        }

        // Restore Windows line endings if the file originally used them.
        $final = str_contains(file_get_contents($path) ?: '', "\r\n")
            ? str_replace("\n", "\r\n", $contents)
            : $contents;

        $written = file_put_contents($path, $final);
        if ($written === false) {
            throw new RuntimeException("Unable to write .env file at: {$path}");
        }
    }

    private static function formatValue(string $value): string
    {
        $value = (string) $value;

        // Quote values that commonly break dotenv parsing.
        $needsQuotes = preg_match('/\s|#|"|=/', $value) === 1;
        if (! $needsQuotes) {
            return $value;
        }

        $escaped = str_replace('"', '\\"', $value);

        return '"'.$escaped.'"';
    }
}
