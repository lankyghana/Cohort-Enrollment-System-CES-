<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (! Schema::hasColumn('courses', 'published')) {
                $table->boolean('published')->default(false)->index();
            }
            if (! Schema::hasColumn('courses', 'price_minor')) {
                $table->unsignedBigInteger('price_minor')->nullable()->index();
            }
            if (! Schema::hasColumn('courses', 'duration_value')) {
                $table->unsignedInteger('duration_value')->nullable();
            }
            if (! Schema::hasColumn('courses', 'duration_unit')) {
                $table->string('duration_unit', 16)->nullable();
            }
            if (! Schema::hasColumn('courses', 'thumbnail_path')) {
                $table->string('thumbnail_path')->nullable();
            }
            if (! Schema::hasColumn('courses', 'banner_path')) {
                $table->string('banner_path')->nullable();
            }
        });

        // Backfill published based on existing status values.
        if (Schema::hasColumn('courses', 'status')) {
            DB::table('courses')->update([
                'published' => DB::raw("CASE WHEN status = 'published' THEN 1 ELSE 0 END"),
            ]);
        }

        // Backfill price_minor from legacy decimal price if present.
        if (Schema::hasColumn('courses', 'price') && Schema::hasColumn('courses', 'price_minor')) {
            DB::table('courses')
                ->whereNull('price_minor')
                ->update([
                    'price_minor' => DB::raw('ROUND(price * 100)'),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'banner_path')) {
                $table->dropColumn('banner_path');
            }
            if (Schema::hasColumn('courses', 'thumbnail_path')) {
                $table->dropColumn('thumbnail_path');
            }
            if (Schema::hasColumn('courses', 'duration_unit')) {
                $table->dropColumn('duration_unit');
            }
            if (Schema::hasColumn('courses', 'duration_value')) {
                $table->dropColumn('duration_value');
            }
            if (Schema::hasColumn('courses', 'price_minor')) {
                $table->dropColumn('price_minor');
            }
            if (Schema::hasColumn('courses', 'published')) {
                $table->dropColumn('published');
            }
        });
    }
};
