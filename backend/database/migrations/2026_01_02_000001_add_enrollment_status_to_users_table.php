<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('status', 20)->default('active')->after('role');
            $table->boolean('has_active_enrollment')->default(false)->after('status');
        });

        // Backfill existing users to avoid breaking current access.
        DB::table('users')->whereNull('status')->orWhere('status', '')->update([
            'status' => 'active',
        ]);

        // Backfill enrollment flag based on paid enrollments.
        $paidStudentIds = DB::table('enrollments')
            ->where('payment_status', 'paid')
            ->distinct()
            ->pluck('student_id')
            ->all();

        if (! empty($paidStudentIds)) {
            DB::table('users')->whereIn('id', $paidStudentIds)->update([
                'has_active_enrollment' => true,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'has_active_enrollment']);
        });
    }
};
