<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (! Schema::hasColumn('enrollments', 'total_price')) {
                $table->decimal('total_price', 10, 2)->default(0)->after('course_id');
            }
            // amount_paid already exists.
            if (! Schema::hasColumn('enrollments', 'balance_due')) {
                $table->decimal('balance_due', 10, 2)->default(0)->after('amount_paid');
            }
            if (! Schema::hasColumn('enrollments', 'payment_deadline')) {
                $table->dateTime('payment_deadline')->nullable()->after('balance_due');
            }
            if (! Schema::hasColumn('enrollments', 'access_locked')) {
                $table->boolean('access_locked')->default(false)->after('payment_deadline');
            }
            if (! Schema::hasColumn('enrollments', 'last_balance_reminder_sent_at')) {
                $table->timestamp('last_balance_reminder_sent_at')->nullable()->after('access_locked');
            }

            $table->index(['student_id', 'course_id', 'balance_due']);
            $table->index(['student_id', 'access_locked']);
        });

        // Backfill amounts for existing enrollments.
        // Keep SQL portable (SQLite used in tests) by avoiding JOIN updates and GREATEST().
        if (Schema::hasTable('courses')) {
            DB::table('enrollments')->update([
                'total_price' => DB::raw('(SELECT COALESCE(price, 0) FROM courses WHERE courses.id = enrollments.course_id)'),
            ]);

            DB::table('enrollments')->update([
                'balance_due' => DB::raw('CASE WHEN (COALESCE(total_price, 0) - COALESCE(amount_paid, 0)) > 0 THEN (COALESCE(total_price, 0) - COALESCE(amount_paid, 0)) ELSE 0 END'),
            ]);

            DB::table('enrollments')->whereNull('payment_deadline')->update([
                'payment_deadline' => DB::raw('(SELECT start_date FROM courses WHERE courses.id = enrollments.course_id)'),
            ]);

            // Treat access_locked as an explicit/manual lock; do not auto-lock during migration.
            DB::table('enrollments')->update([
                'access_locked' => DB::raw('0'),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            foreach (['total_price', 'balance_due', 'payment_deadline', 'access_locked', 'last_balance_reminder_sent_at'] as $col) {
                if (Schema::hasColumn('enrollments', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
