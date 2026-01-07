<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Platform-wide enrollment fee (used for all courses).
        // Stored as a numeric string to match existing settings conventions.
        Setting::setValue('enrollment_fee', '50');

        // If you want the platform currency explicitly set to GHS, uncomment:
        // Setting::setValue('platform_currency', 'GHS');
        // Setting::setValue('currency', 'GHS');
    }

    public function down(): void
    {
        // Leave as-is on rollback to avoid deleting a value that may have been changed in production.
    }
};
