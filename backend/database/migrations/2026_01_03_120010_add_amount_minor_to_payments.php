<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (! Schema::hasColumn('payments', 'amount_minor')) {
                $table->unsignedBigInteger('amount_minor')->nullable()->index();
            }
        });

        // Backfill amount_minor from legacy decimal amount if present.
        if (Schema::hasColumn('payments', 'amount') && Schema::hasColumn('payments', 'amount_minor')) {
            DB::table('payments')
                ->whereNull('amount_minor')
                ->update([
                    'amount_minor' => DB::raw('ROUND(amount * 100)'),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'amount_minor')) {
                $table->dropColumn('amount_minor');
            }
        });
    }
};
